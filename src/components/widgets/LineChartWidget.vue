<template>
  <div class="h-full flex flex-col p-4">
    <div class="text-xs opacity-50 mb-2 truncate">{{ title }}</div>
    <div class="flex-1 min-h-0">
      <v-chart :option="chartOption" autoresize style="width: 100%; height: 100%" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useChartColors } from '@/composables/useChartColors'
import { useChartOptions } from '@/composables/useChartOptions'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: Number, default: null },
  sensor: { type: Object, default: null },
  history: { type: Array, default: () => [] },
})

const { colors } = useChartColors()
const { lineOption } = useChartOptions()

const chartData = computed(() => {
  if (props.history.length) return props.history
  const base = props.value ?? props.sensor?.currentValue ?? 50
  const variance = (props.sensor?.max || 100) * 0.05
  return Array.from({ length: 30 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    value: +(base + (Math.random() - 0.5) * variance * 2).toFixed(1),
  }))
})

const chartOption = computed(() =>
  lineOption({
    categories: chartData.value.map((d) => d.time),
    values: chartData.value.map((d) => d.value),
    color: colors.value.chart1,
  }),
)
</script>
