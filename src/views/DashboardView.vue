<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <!-- Выбор мониторимого станка + кнопка настройки шапки в один ряд -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <label class="text-xs text-muted-foreground">СТАНОК:</label>
          <Select v-model="monitoredId">
            <SelectTrigger class="w-[220px] h-9">
              <SelectValue placeholder="Выберите станок" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="eq in equipmentStore.list" :key="eq.id" :value="eq.id">
                {{ eq.id }} — {{ STATUS_LABELS[eq.status] || eq.status }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          :variant="headerEditing ? 'default' : 'outline'"
          size="sm"
          @click="headerEditing = !headerEditing"
        >
          <component :is="headerEditing ? Check : SlidersHorizontal" class="w-4 h-4" />
          {{ headerEditing ? 'Готово' : 'Настроить' }}
        </Button>
      </div>

      <!-- Кастомизируемая шапка: порядок и видимость блоков настраиваются -->
      <CustomizableSections
        page-key="dashboard-header"
        :sections="headerSections"
        v-model:editing="headerEditing"
        hide-toolbar
      >
        <template #atrisk>
          <DashboardAtRiskPanel />
        </template>

        <template #metrics>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs text-muted-foreground">ПОКАЗАТЕЛИ — {{ monitoredId }}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal class="w-4 h-4" />
                    Показатели
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-60">
                  <DropdownMenuLabel>Отображать показатели</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    v-for="m in METRIC_CATALOG"
                    :key="m.key"
                    :model-value="selectedMetricKeys.includes(m.key)"
                    @select="(e) => { e.preventDefault(); toggleMetric(m.key) }"
                  >
                    {{ m.title }}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div v-if="headerMetrics.length" class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <MetricCard
                v-for="metric in headerMetrics"
                :key="metric.key"
                :title="metric.title"
                :value="metric.value"
                :unit="metric.unit"
                :trend="metric.trend"
                :status="metric.status"
                :subtitle="metric.subtitle"
              />
            </div>
            <div
              v-else
              class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground"
            >
              Не выбрано ни одного показателя.
            </div>
          </div>
        </template>

        <template #charts>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget title="ВИБРАЦИЯ (мм/с)" :data="vibrationData" unit="мм/с" :height="240" />
            <ChartWidget
              title="ТЕМПЕРАТУРА ДВИГАТЕЛЯ (°C)"
              :data="temperatureData"
              unit="°C"
              :height="240"
            />
          </div>
        </template>

        <template #indicators>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatusIndicator
              label="МОЩНОСТЬ"
              :value="liveVal('power', 87)"
              :max="100"
              :status="liveVal('power', 87) >= 90 ? 'warning' : 'normal'"
            />
            <StatusIndicator
              label="КРУТЯЩИЙ МОМЕНТ"
              :value="liveVal('torque', 340)"
              :max="600"
              unit="Нм"
              status="normal"
            />
            <StatusIndicator
              label="ИЗНОС ИНСТРУМЕНТА"
              :value="liveVal('tool-wear', 62)"
              :max="100"
              :status="liveVal('tool-wear', 62) >= 70 ? 'warning' : 'normal'"
            />
            <StatusIndicator
              label="РАСХОД ТОПЛИВА"
              :value="liveVal('fuel-rate', 18.5)"
              :max="25"
              unit="Л/Ч"
              status="normal"
            />
          </div>
        </template>
      </CustomizableSections>

      <!-- Парк (всегда виден) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <RouterLink
          v-for="eq in equipmentCards"
          :key="eq.id"
          :to="{ name: 'equipment-detail', params: { id: eq.id } }"
          class="cursor-pointer"
        >
          <Card class="h-full transition-colors hover:bg-accent/50">
            <CardHeader class="pb-2">
              <CardTitle class="text-base">{{ eq.id }}</CardTitle>
              <div class="text-xs text-muted-foreground">{{ eq.model }}</div>
            </CardHeader>
            <CardContent>
              <div class="flex items-center gap-2">
                <span
                  class="inline-block h-2 w-2 rounded-full"
                  :class="STATUS_DOT_COLORS[eq.status]"
                />
                <span class="text-sm" :class="STATUS_COLORS[eq.status]">
                  {{ STATUS_LABELS[eq.status] || eq.status }}
                </span>
              </div>
            </CardContent>
          </Card>
        </RouterLink>
      </div>

      <div class="overflow-x-auto">
        <DataTable :data="tableData" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { SlidersHorizontal, Check } from 'lucide-vue-next'
import { useEquipmentStore } from '@/stores/equipment'
import { useSensorsStore } from '@/stores/sensors'
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/utils/constants'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import MetricCard from '@/components/MetricCard.vue'
import ChartWidget from '@/components/ChartWidget.vue'
import StatusIndicator from '@/components/StatusIndicator.vue'
import DataTable from '@/components/DataTable.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import CustomizableSections from '@/components/customize/CustomizableSections.vue'
import DashboardAtRiskPanel from '@/components/dashboard/DashboardAtRiskPanel.vue'

const equipmentStore = useEquipmentStore()
const sensorsStore = useSensorsStore()

const headerSections = [
  { id: 'atrisk', label: 'Требуют внимания' },
  { id: 'metrics', label: 'Показатели станка' },
  { id: 'charts', label: 'Графики' },
  { id: 'indicators', label: 'Индикаторы нагрузки' },
]

// Режим настройки шапки (управляет встроенным CustomizableSections).
const headerEditing = ref(false)

// ── Выбор мониторимого станка ──────────────────────────────────────────────
const MACHINE_KEY = 'rudgormash:dashboard-machine'
const monitoredId = ref('')

watch(monitoredId, (id, prev) => {
  if (!id || id === prev) return
  localStorage.setItem(MACHINE_KEY, id)
  sensorsStore.loadSensorDefs(id)
  sensorsStore.startPolling(id, 5000)
})

// ── Каталог показателей шапки ──────────────────────────────────────────────
const METRIC_CATALOG = [
  { key: 'speed', title: 'ОБОРОТЫ', sensorId: 'speed', unit: 'RPM', fallback: 2340 },
  { key: 'temp', title: 'ТЕМПЕРАТУРА', sensorId: 'temp-engine', unit: '°C', fallback: 82, warn: 80, crit: 90 },
  { key: 'depth', title: 'ГЛУБИНА БУРЕНИЯ', sensorId: 'depth', unit: 'М', fallback: 45.3 },
  { key: 'pressure', title: 'ДАВЛЕНИЕ', sensorId: 'pressure', unit: 'БАР', fallback: 124, warn: 130, crit: 145 },
  { key: 'vibration', title: 'ВИБРАЦИЯ', sensorId: 'vibration', unit: 'мм/с', fallback: 0.85, warn: 1.5, crit: 2.5 },
  { key: 'power', title: 'МОЩНОСТЬ', sensorId: 'power', unit: '%', fallback: 87, warn: 90, crit: 95 },
  { key: 'torque', title: 'КРУТЯЩИЙ МОМЕНТ', sensorId: 'torque', unit: 'Нм', fallback: 340, warn: 450, crit: 550 },
  { key: 'tool-wear', title: 'ИЗНОС ДОЛОТА', sensorId: 'tool-wear', unit: '%', fallback: 62, warn: 70, crit: 90 },
  { key: 'fuel-rate', title: 'РАСХОД ТОПЛИВА', sensorId: 'fuel-rate', unit: 'Л/Ч', fallback: 18.5, warn: 22, crit: 27 },
  { key: 'oil-level', title: 'УРОВЕНЬ МАСЛА', sensorId: 'oil-level', unit: '%', fallback: 94 },
  { key: 'engine-load', title: 'ЗАГРУЗКА ДВИГ.', sensorId: 'engine-load', unit: '%', fallback: 84, warn: 90, crit: 97 },
]
const CATALOG_KEYS = METRIC_CATALOG.map((m) => m.key)
const DEFAULT_KEYS = ['speed', 'temp', 'depth', 'pressure']
const METRICS_KEY = 'rudgormash:dashboard-metrics'

function loadMetricKeys() {
  try {
    const raw = localStorage.getItem(METRICS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.filter((k) => CATALOG_KEYS.includes(k))
    }
  } catch {
    // игнорируем повреждённые данные
  }
  return [...DEFAULT_KEYS]
}

const selectedMetricKeys = ref(loadMetricKeys())

watch(
  selectedMetricKeys,
  (val) => {
    try {
      localStorage.setItem(METRICS_KEY, JSON.stringify(val))
    } catch {
      // localStorage недоступен
    }
  },
  { deep: true },
)

function toggleMetric(key) {
  const keys = selectedMetricKeys.value
  selectedMetricKeys.value = keys.includes(key)
    ? keys.filter((k) => k !== key)
    : [...keys, key]
}

function liveVal(sensorId, fallback) {
  if (!monitoredId.value) return fallback
  return sensorsStore.getSensorValue(monitoredId.value, sensorId) ?? fallback
}

function statusFor(m, value) {
  if (m.crit != null && value >= m.crit) return 'critical'
  if (m.warn != null && value >= m.warn) return 'warning'
  return 'normal'
}

const headerMetrics = computed(() =>
  METRIC_CATALOG.filter((m) => selectedMetricKeys.value.includes(m.key)).map((m) => {
    const value = liveVal(m.sensorId, m.fallback)
    return {
      key: m.key,
      title: m.title,
      value: String(value),
      unit: m.unit,
      trend: 'neutral',
      status: statusFor(m, value),
      subtitle: '',
    }
  }),
)

onMounted(async () => {
  if (!equipmentStore.list.length) {
    await equipmentStore.fetchList()
  }
  // Детали всех станков нужны для панели «Требуют внимания».
  await Promise.all(
    equipmentStore.list
      .filter((e) => !equipmentStore.getDetail(e.id))
      .map((e) => equipmentStore.fetchById(e.id)),
  )

  const saved = localStorage.getItem(MACHINE_KEY)
  const exists = saved && equipmentStore.list.some((e) => e.id === saved)
  monitoredId.value = exists ? saved : equipmentStore.list[0]?.id || ''
})

onUnmounted(() => {
  sensorsStore.stopPolling()
})

const vibrationData = computed(() =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    value: +(0.5 + Math.random() * 0.8).toFixed(2),
  })),
)

const temperatureData = computed(() =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    value: +(75 + Math.random() * 15).toFixed(1),
  })),
)

const equipmentCards = computed(() => equipmentStore.list.slice(0, 8))

const tableData = computed(() =>
  equipmentStore.list.slice(0, 5).map((eq) => {
    const detail = equipmentStore.getDetail(eq.id)
    const read = (id, fb) => detail?.sensors?.find((s) => s.id === id)?.currentValue ?? fb
    return {
      id: eq.id,
      equipment: eq.fullModel || eq.model,
      depth: read('depth', 0),
      speed: read('speed', 0),
      temperature: read('temp-engine', 0),
      status: STATUS_LABELS[eq.status] || eq.status,
    }
  }),
)
</script>
