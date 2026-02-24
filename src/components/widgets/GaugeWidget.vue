<template>
  <div class="h-full flex flex-col p-4">
    <div class="text-xs opacity-50 mb-2 truncate">{{ title }}</div>
    <div class="flex-1 min-h-0">
      <v-chart :option="gaugeOption" autoresize style="width: 100%; height: 100%" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { useChartColors } from '@/composables/useChartColors'

use([GaugeChart, CanvasRenderer])

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: Number, default: null },
  sensor: { type: Object, default: null },
})

const { colors } = useChartColors()

const maxVal = computed(() => props.sensor?.max || 100)

const gaugeOption = computed(() => {
  const c = colors.value
  const val = props.value ?? 0
  const warn = props.sensor?.thresholds?.warning ?? maxVal.value * 0.7
  const crit = props.sensor?.thresholds?.critical ?? maxVal.value * 0.9

  return {
    series: [
      {
        type: 'gauge',
        min: 0,
        max: maxVal.value,
        progress: { show: true, width: 12 },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [
              [warn / maxVal.value, c.foreground + '33'],
              [crit / maxVal.value, '#EAB308'],
              [1, '#EF4444'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 22,
          fontFamily: 'JetBrains Mono',
          color: c.foreground,
          offsetCenter: [0, '10%'],
          formatter: `{value} ${props.sensor?.unit || ''}`,
        },
        data: [{ value: val }],
      },
    ],
  }
})
</script>
