<template>
  <div class="bg-surface-1 border border-border rounded-md p-6">
    <div class="flex items-center justify-between mb-4">
      <label class="text-xs">{{ title }}</label>
      <div class="text-xs opacity-50 metric-value">{{ lastValue }} {{ unit }}</div>
    </div>

    <v-chart :option="chartOption" :style="{ height: height + 'px' }" autoresize />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useChartOptions } from '@/composables/useChartOptions'

use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
])

const props = defineProps({
  title: { type: String, required: true },
  data: { type: Array, required: true },
  unit: { type: String, default: '' },
  height: { type: Number, default: 200 },
  type: { type: String, default: 'line' },
})

const { lineOption, barOption } = useChartOptions()

const lastValue = computed(() => {
  if (!props.data.length) return ''
  return props.data[props.data.length - 1]?.value ?? ''
})

const chartOption = computed(() => {
  const categories = props.data.map((d) => d.time || d.month || '')
  const values = props.data.map((d) => d.value ?? d.depth ?? 0)
  if (props.type === 'bar') {
    return barOption({ categories, values })
  }
  return lineOption({ categories, values })
})
</script>
