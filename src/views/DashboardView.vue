<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          v-for="metric in topMetrics"
          :key="metric.title"
          :title="metric.title"
          :value="metric.value"
          :unit="metric.unit"
          :trend="metric.trend"
          :status="metric.status"
          :subtitle="metric.subtitle"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget title="ВИБРАЦИЯ (мм/с)" :data="vibrationData" unit="мм/с" :height="240" />
        <ChartWidget
          title="ТЕМПЕРАТУРА ДВИГАТЕЛЯ (°C)"
          :data="temperatureData"
          unit="°C"
          :height="240"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <RouterLink
          v-for="eq in equipmentCards"
          :key="eq.id"
          :to="{ name: 'equipment-detail', params: { id: eq.id } }"
          class="cursor-pointer"
        >
          <EquipmentCard
            :name="eq.id"
            :equipment-id="eq.model"
            :is-active="eq.status === 'working'"
            :status="eq.cardStatus"
          />
        </RouterLink>
      </div>

      <DataTable :data="tableData" />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import { useSensorsStore } from '@/stores/sensors'
import MetricCard from '@/components/MetricCard.vue'
import ChartWidget from '@/components/ChartWidget.vue'
import StatusIndicator from '@/components/StatusIndicator.vue'
import EquipmentCard from '@/components/EquipmentCard.vue'
import DataTable from '@/components/DataTable.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const equipmentStore = useEquipmentStore()
const sensorsStore = useSensorsStore()

const primaryId = computed(() => equipmentStore.list[0]?.id)

onMounted(async () => {
  if (!equipmentStore.list.length) {
    await equipmentStore.fetchList()
  }
  if (primaryId.value) {
    sensorsStore.startPolling(primaryId.value, 5000)
  }
})

onUnmounted(() => {
  sensorsStore.stopPolling()
})

function liveVal(sensorId, fallback) {
  if (!primaryId.value) return fallback
  return sensorsStore.getSensorValue(primaryId.value, sensorId) ?? fallback
}

const STATUS_LABELS = {
  working: 'РАБОТА',
  idle: 'ПРОСТОЙ',
  malfunction: 'АВАРИЯ',
  offline: 'ОТКЛЮЧЕНО',
}

const topMetrics = computed(() => {
  const first = equipmentStore.list[0]
  if (!first) return []
  const temp = liveVal('temp-engine', 82)
  return [
    {
      title: `СТАНОК ${first.id}`,
      value: String(liveVal('speed', 2340)),
      unit: 'RPM',
      trend: 'up',
      status: 'normal',
      subtitle: first.model,
    },
    {
      title: 'ТЕМПЕРАТУРА',
      value: String(temp),
      unit: '°C',
      trend: temp >= 80 ? 'up' : 'neutral',
      status: temp >= 90 ? 'critical' : temp >= 80 ? 'warning' : 'normal',
      subtitle: temp >= 90 ? 'Превышение!' : 'В пределах нормы',
    },
    {
      title: 'ГЛУБИНА БУРЕНИЯ',
      value: String(liveVal('depth', 45.3)),
      unit: 'М',
      trend: 'up',
      status: 'normal',
      subtitle: 'Целевая: 50м',
    },
    {
      title: 'ДАВЛЕНИЕ',
      value: String(liveVal('pressure', 124)),
      unit: 'БАР',
      trend: 'neutral',
      status: 'normal',
      subtitle: 'Номинальное',
    },
  ]
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

const equipmentCards = computed(() =>
  equipmentStore.list.slice(0, 5).map((eq) => {
    const statusKey =
      eq.status === 'working' ? 'active' : eq.status === 'malfunction' ? 'error' : 'warning'
    return {
      ...eq,
      cardStatus: [
        { label: 'Модель', value: eq.model, status: statusKey },
        { label: 'Статус', value: STATUS_LABELS[eq.status] || eq.status, status: statusKey },
      ],
    }
  }),
)

const tableData = computed(() =>
  equipmentStore.list.slice(0, 5).map((eq) => ({
    id: eq.id,
    equipment: eq.fullModel || eq.model,
    depth: liveVal('depth', 45.3),
    speed: liveVal('speed', 2340),
    temperature: liveVal('temp-engine', 82),
    status: STATUS_LABELS[eq.status] || eq.status,
  })),
)
</script>
