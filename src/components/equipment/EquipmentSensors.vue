<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card v-for="sensor in sensors" :key="sensor.id">
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-xs opacity-70">{{ sensor.label }}</CardTitle>
          <Badge :variant="getThresholdVariant(sensor)">
            {{ getThresholdLabel(sensor) }}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex items-baseline gap-2 mb-3">
          <span class="metric-value text-3xl font-bold tracking-tight">
            {{ getLiveDisplay(sensor) }}
          </span>
          <span class="text-sm opacity-60 metric-value">{{ sensor.unit }}</span>
        </div>

        <div class="h-16">
          <v-chart :option="getSparklineOption(sensor)" autoresize class="w-full h-full" />
        </div>

        <div class="flex items-center justify-between mt-2 text-xs opacity-50 metric-value">
          <span>MIN {{ sensor.min }}</span>
          <span>MAX {{ sensor.max }}</span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useSensorsStore } from '@/stores/sensors'
import { useChartColors } from '@/composables/useChartColors'
import { useChartOptions } from '@/composables/useChartOptions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

use([LineChart, GridComponent, CanvasRenderer])

const props = defineProps({
  equipmentId: { type: String, required: true },
  sensors: { type: Array, default: () => [] },
})

const sensorsStore = useSensorsStore()
const { colors } = useChartColors()
const { lineOption } = useChartOptions()

function getLiveValue(sensor) {
  const live = sensorsStore.getSensorValue(props.equipmentId, sensor.id)
  if (live !== null) return live
  return sensor.currentValue ?? 0
}

function getLiveDisplay(sensor) {
  const val = getLiveValue(sensor)
  return val >= 1000 ? val.toLocaleString('ru-RU') : String(val)
}

function getThresholdVariant(sensor) {
  const val = getLiveValue(sensor)
  if (sensor.thresholds) {
    if (sensor.id === 'oil-level') {
      if (val <= sensor.thresholds.critical) return 'destructive'
      if (val <= sensor.thresholds.warning) return 'secondary'
      return 'outline'
    }
    if (val >= sensor.thresholds.critical) return 'destructive'
    if (val >= sensor.thresholds.warning) return 'secondary'
  }
  return 'outline'
}

function getThresholdLabel(sensor) {
  const val = getLiveValue(sensor)
  if (sensor.thresholds) {
    if (sensor.id === 'oil-level') {
      if (val <= sensor.thresholds.critical) return 'КРИТИЧНО'
      if (val <= sensor.thresholds.warning) return 'ВНИМАНИЕ'
      return 'НОРМА'
    }
    if (val >= sensor.thresholds.critical) return 'КРИТИЧНО'
    if (val >= sensor.thresholds.warning) return 'ВНИМАНИЕ'
  }
  return 'НОРМА'
}

const sparklineCache = computed(() => {
  const cache = {}
  for (const sensor of props.sensors) {
    const base = getLiveValue(sensor)
    const variance = (sensor.max - sensor.min) * 0.05
    cache[sensor.id] = Array.from({ length: 12 }, (_, i) => {
      const drift = (Math.random() - 0.5) * variance * 2
      return {
        time: `${String(Math.floor(i * 5)).padStart(2, '0')}м`,
        value: +(base + drift).toFixed(1),
      }
    })
  }
  return cache
})

function getSparklineOption(sensor) {
  const data = sparklineCache.value[sensor.id] || []
  return lineOption({
    categories: data.map((d) => d.time),
    values: data.map((d) => d.value),
    color: colors.value.chart1,
    sparkline: true,
  })
}
</script>
