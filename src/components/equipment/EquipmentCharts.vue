<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartWidget title="МОЩНОСТЬ (%)" :data="powerData" unit="%" :height="280" />
      <ChartWidget title="ГЛУБИНА БУРЕНИЯ (М)" :data="depthData" unit="м" :height="280" />
    </div>
    <div class="grid grid-cols-1 gap-6">
      <ChartWidget title="КРУТЯЩИЙ МОМЕНТ (Нм)" :data="torqueData" unit="Нм" :height="280" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSensorsStore } from '@/stores/sensors'
import { useEquipmentStore } from '@/stores/equipment'
import ChartWidget from '@/components/ChartWidget.vue'

const props = defineProps({
  equipmentId: { type: String, required: true },
})

const sensorsStore = useSensorsStore()
const equipmentStore = useEquipmentStore()

function getSensorNum(sensorId) {
  const equipment = equipmentStore.getDetail(props.equipmentId)
  const live = sensorsStore.getSensorValue(props.equipmentId, sensorId)
  if (live !== null) return live
  const sensor = equipment?.sensors?.find((s) => s.id === sensorId)
  return sensor?.currentValue ?? 0
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
</script>
