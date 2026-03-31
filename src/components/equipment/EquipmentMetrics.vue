<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
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
      :value="equipment ? String(2026 - equipment.year) : '—'"
      unit="ЛЕТ"
      :trend="isWorking ? 'up' : 'neutral'"
      status="normal"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSensorsStore } from '@/stores/sensors'
import { useEquipmentStore } from '@/stores/equipment'
import MetricCard from '@/components/MetricCard.vue'

const props = defineProps({
  equipmentId: { type: String, required: true },
})

const sensorsStore = useSensorsStore()
const equipmentStore = useEquipmentStore()

const equipment = computed(() => equipmentStore.getDetail(props.equipmentId))
const isWorking = computed(() => equipment.value?.status === 'working')

function findSensor(sensorId) {
  return equipment.value?.sensors?.find((s) => s.id === sensorId)
}

function getSensorNum(sensorId) {
  const live = sensorsStore.getSensorValue(props.equipmentId, sensorId)
  if (live !== null) return live
  return findSensor(sensorId)?.currentValue ?? 0
}

function getSensorDisplay(sensorId) {
  const val = getSensorNum(sensorId)
  return val >= 1000 ? val.toLocaleString('ru-RU') : String(val)
}

const tempValue = computed(() => getSensorNum('temp-engine'))
</script>
