<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !current" />

    <template v-else-if="current">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <RouterLink
            to="/equipment"
            class="p-3 border-2 border-border hover:bg-surface-2 transition-all duration-150"
          >
            <ArrowLeft class="w-5 h-5" />
          </RouterLink>
          <div>
            <h2 class="text-2xl">{{ current.id }}</h2>
            <div class="metric-value text-sm opacity-50 mt-1">
              {{ current.fullModel }} &bull; ID: {{ current.serial }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div
            class="flex items-center gap-2 px-4 py-2 border-2"
            :class="isWorking ? 'border-primary' : 'border-border opacity-60'"
          >
            <div class="w-2 h-2" :class="isWorking ? 'bg-primary animate-pulse' : 'bg-border'" />
            <span class="text-xs">{{ current.statusLabel }}</span>
          </div>
          <button
            class="flex items-center gap-2 px-4 py-3 border-2 border-border hover:bg-surface-2 transition-all duration-150"
          >
            <component :is="isWorking ? Pause : Play" class="w-5 h-5" />
            <span class="text-sm">{{ isWorking ? 'ОСТАНОВИТЬ' : 'ЗАПУСТИТЬ' }}</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="СКОРОСТЬ ВРАЩЕНИЯ"
          :value="getSensorDisplay('speed')"
          unit="RPM"
          :trend="isWorking ? 'up' : 'neutral'"
          :status="isWorking ? 'normal' : 'warning'"
        />
        <MetricCard
          title="ГЛУБИНА"
          :value="getSensorDisplay('depth')"
          unit="М"
          :trend="isWorking ? 'up' : 'neutral'"
          status="normal"
        />
        <MetricCard
          title="ТЕМПЕРАТУРА"
          :value="getSensorDisplay('temp-engine')"
          unit="°C"
          :trend="tempValue >= 90 ? 'up' : 'neutral'"
          :status="tempValue >= 90 ? 'critical' : tempValue >= 80 ? 'warning' : 'normal'"
        />
        <MetricCard
          title="ДАВЛЕНИЕ"
          :value="getSensorDisplay('pressure')"
          unit="БАР"
          trend="neutral"
          status="normal"
        />
        <MetricCard
          title="ВРЕМЯ РАБОТЫ"
          :value="current.year ? String(2026 - current.year) : '—'"
          unit="ЛЕТ"
          :trend="isWorking ? 'up' : 'neutral'"
          status="normal"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget title="МОЩНОСТЬ (%)" :data="powerData" unit="%" :height="280" />
        <ChartWidget title="ГЛУБИНА БУРЕНИЯ (М)" :data="depthData" unit="м" :height="280" />
      </div>
      <div class="grid grid-cols-1 gap-6">
        <ChartWidget title="КРУТЯЩИЙ МОМЕНТ (Нм)" :data="torqueData" unit="Нм" :height="280" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusIndicator
          label="ЗАГРУЗКА ДВИГАТЕЛЯ"
          :value="getSensorNum('engine-load')"
          :max="100"
          status="normal"
        />
        <StatusIndicator
          label="РАСХОД ТОПЛИВА"
          :value="getSensorNum('fuel-rate')"
          :max="25"
          unit="Л/Ч"
          status="normal"
        />
        <StatusIndicator
          label="ИЗНОС ДОЛОТА"
          :value="getSensorNum('tool-wear')"
          :max="100"
          :status="getSensorNum('tool-wear') >= 70 ? 'warning' : 'normal'"
        />
        <StatusIndicator
          label="УРОВЕНЬ МАСЛА"
          :value="getSensorNum('oil-level')"
          :max="100"
          status="normal"
        />
        <StatusIndicator
          label="ДАВЛЕНИЕ ГИДРОСИСТЕМЫ"
          :value="getSensorNum('pressure')"
          :max="150"
          unit="БАР"
          status="normal"
        />
        <StatusIndicator
          label="ТЕМПЕРАТУРА ГИДРОМАСЛА"
          :value="getSensorNum('oil-temp')"
          :max="80"
          unit="°C"
          status="normal"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-surface-1 border-2 border-border p-6">
          <label class="text-xs mb-4 block">ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ</label>
          <div class="space-y-3">
            <div
              v-for="spec in current.specs"
              :key="spec.label"
              class="flex justify-between text-sm"
            >
              <span class="opacity-70">{{ spec.label }}</span>
              <span class="metric-value">{{ spec.value }}</span>
            </div>
          </div>
        </div>

        <div class="bg-surface-1 border-2 border-border p-6">
          <label class="text-xs mb-4 block">ИСТОРИЯ ОБСЛУЖИВАНИЯ</label>
          <div class="space-y-4">
            <div
              v-for="item in current.serviceHistory"
              :key="item.date"
              class="pb-3 border-b border-border last:border-0"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-sm">{{ item.type }}</div>
                  <div class="metric-value text-xs opacity-50 mt-1">{{ item.date }}</div>
                </div>
                <div class="text-xs px-2 py-1 border border-border">{{ item.status }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-surface-1 border-2 border-border p-6">
        <label class="text-xs mb-4 block">ЗАМЕНЫ ДЕТАЛЕЙ</label>
        <div v-if="partsLoading" class="text-center py-6 opacity-50">
          <LoadingSpinner />
        </div>
        <div v-else-if="parts.length === 0" class="text-center py-6 text-sm opacity-40">
          НЕТ ДАННЫХ О ЗАМЕНАХ
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-border text-xs opacity-50">
              <th class="text-left py-2 pr-4">ДАТА</th>
              <th class="text-left py-2 pr-4">ДЕТАЛЬ</th>
              <th class="text-left py-2 pr-4">АРТИКУЛ</th>
              <th class="text-left py-2 pr-4">ОРИГИНАЛ</th>
              <th class="text-left py-2">ИСПОЛНИТЕЛЬ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in parts" :key="part.id" class="border-b border-border last:border-0">
              <td class="py-3 pr-4 metric-value opacity-70">{{ part.date }}</td>
              <td class="py-3 pr-4">{{ part.partName }}</td>
              <td class="py-3 pr-4 metric-value opacity-50">{{ part.partNumber }}</td>
              <td class="py-3 pr-4">
                <span
                  class="text-xs px-2 py-0.5 border"
                  :class="
                    part.isOriginal
                      ? 'border-primary text-primary'
                      : 'border-status-critical-text text-status-critical-text'
                  "
                >
                  {{ part.isOriginal ? 'ОРИГИНАЛ' : 'АНАЛОГ' }}
                </span>
              </td>
              <td class="py-3 opacity-70">{{ part.replacedBy }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-surface-1 border-2 border-border p-6">
        <label class="text-xs mb-4 block">ИСТОРИЧЕСКИЕ ДАННЫЕ ДАТЧИКОВ</label>
        <div class="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label class="text-xs opacity-50 mb-1 block">ДАТЧИК</label>
            <select
              v-model="historySensorId"
              class="bg-background border-2 border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option v-for="s in sensorOptions" :key="s.id" :value="s.id">
                {{ s.label }} ({{ s.unit }})
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs opacity-50 mb-1 block">ОТ</label>
            <input
              v-model="historyFrom"
              type="date"
              class="bg-background border-2 border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="text-xs opacity-50 mb-1 block">ДО</label>
            <input
              v-model="historyTo"
              type="date"
              class="bg-background border-2 border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            class="px-4 py-2 border-2 border-primary text-sm hover:bg-surface-2 transition-all duration-150"
            @click="loadHistory"
          >
            ЗАГРУЗИТЬ
          </button>
        </div>

        <div v-if="historyLoading" class="text-center py-8 opacity-50">
          <LoadingSpinner />
        </div>
        <div v-else-if="historyData.length === 0" class="text-center py-8 text-sm opacity-40">
          НЕТ ДАННЫХ. ВЫБЕРИТЕ ДАТЧИК И ПЕРИОД
        </div>
        <div v-else>
          <ChartWidget
            :title="historyChartTitle"
            :data="historyChartData"
            :unit="historySensorUnit"
            :height="320"
          />
        </div>
      </div>
    </template>

    <div v-else class="text-center py-12 opacity-50">
      <div class="text-sm">ОБОРУДОВАНИЕ НЕ НАЙДЕНО</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Pause, Play } from 'lucide-vue-next'
import { useEquipmentStore } from '@/stores/equipment'
import { useSensorsStore } from '@/stores/sensors'
import { getReplacements } from '@/api/parts'
import { getHistory } from '@/api/sensors'
import MetricCard from '@/components/MetricCard.vue'
import ChartWidget from '@/components/ChartWidget.vue'
import StatusIndicator from '@/components/StatusIndicator.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const equipmentStore = useEquipmentStore()
const sensorsStore = useSensorsStore()

const equipmentId = computed(() => route.params.id)

const parts = ref([])
const partsLoading = ref(false)

const historySensorId = ref('temp-engine')
const historyFrom = ref('2026-02-23')
const historyTo = ref('2026-02-24')
const historyData = ref([])
const historyLoading = ref(false)

onMounted(async () => {
  await equipmentStore.fetchById(equipmentId.value)
  sensorsStore.startPolling(equipmentId.value, 5000)
  loadParts()
})

onUnmounted(() => {
  sensorsStore.stopPolling()
})

const current = computed(() => equipmentStore.getDetail(equipmentId.value))

const isWorking = computed(() => current.value?.status === 'working')

const tempValue = computed(() => getSensorNum('temp-engine'))

const sensorOptions = computed(() => current.value?.sensors || [])

const historySensorUnit = computed(() => {
  const s = sensorOptions.value.find((s) => s.id === historySensorId.value)
  return s?.unit || ''
})

const historyChartTitle = computed(() => {
  const s = sensorOptions.value.find((s) => s.id === historySensorId.value)
  return s ? `${s.label} (${s.unit})` : ''
})

const historyChartData = computed(() =>
  historyData.value.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    value: d.value,
  })),
)

function findSensor(sensorId) {
  return current.value?.sensors?.find((s) => s.id === sensorId)
}

function getSensorNum(sensorId) {
  const live = sensorsStore.getSensorValue(equipmentId.value, sensorId)
  if (live !== null) return live
  return findSensor(sensorId)?.currentValue ?? 0
}

function getSensorDisplay(sensorId) {
  const val = getSensorNum(sensorId)
  return val >= 1000 ? val.toLocaleString('ru-RU') : String(val)
}

function generateChartData(baseValue, variance, count = 48) {
  return Array.from({ length: count }, (_, i) => ({
    time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
    value: +(baseValue + Math.random() * variance).toFixed(1),
  }))
}

const powerData = generateChartData(80, 20)
const depthData = computed(() => {
  const baseDepth = getSensorNum('depth')
  return Array.from({ length: 48 }, (_, i) => ({
    time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
    value: +(baseDepth - 5 + i * 0.2 + Math.random() * 2).toFixed(1),
  }))
})
const torqueData = generateChartData(320, 40)

async function loadParts() {
  partsLoading.value = true
  try {
    parts.value = await getReplacements(equipmentId.value)
  } finally {
    partsLoading.value = false
  }
}

async function loadHistory() {
  historyLoading.value = true
  try {
    historyData.value = await getHistory(equipmentId.value, historySensorId.value, {
      from: historyFrom.value,
      to: historyTo.value,
    })
  } finally {
    historyLoading.value = false
  }
}
</script>
