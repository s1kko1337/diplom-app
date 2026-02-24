<template>
  <div class="bg-surface-1 border-2 border-border p-6">
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
import { useChartColors } from '@/composables/useChartColors'

use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
])

const { colors } = useChartColors()

const props = defineProps({
  title: { type: String, required: true },
  data: { type: Array, required: true },
  unit: { type: String, default: '' },
  height: { type: Number, default: 200 },
  type: { type: String, default: 'line' },
})

const lastValue = computed(() => {
  if (!props.data.length) return ''
  return props.data[props.data.length - 1]?.value ?? ''
})

const chartOption = computed(() => {
  const c = colors.value
  return {
    grid: { left: 50, right: 20, top: 10, bottom: 30 },
    xAxis: {
      type: 'category',
      data: props.data.map((d) => d.time || d.month || ''),
      axisLine: { lineStyle: { color: c.foreground, opacity: 0.3 } },
      axisLabel: { fontFamily: 'JetBrains Mono', fontSize: 11, color: c.foreground, opacity: 0.5 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: c.foreground, opacity: 0.3 } },
      axisLabel: { fontFamily: 'JetBrains Mono', fontSize: 11, color: c.foreground, opacity: 0.5 },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: c.foreground, opacity: 0.1 } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.surface2,
      borderColor: c.border,
      borderRadius: 0,
      textStyle: { fontFamily: 'JetBrains Mono', fontSize: 12, color: c.foreground },
    },
    series: [
      {
        type: props.type === 'bar' ? 'bar' : 'line',
        data: props.data.map((d) => d.value ?? d.depth ?? 0),
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 2, color: c.foreground },
        itemStyle: { color: c.foreground },
      },
    ],
  }
})
</script>
