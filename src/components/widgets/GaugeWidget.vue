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
import { GaugeChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { useChartOptions } from '@/composables/useChartOptions'

use([GaugeChart, CanvasRenderer])

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: Number, default: null },
  sensor: { type: Object, default: null },
})

const { gaugeOption } = useChartOptions()

const chartOption = computed(() =>
  gaugeOption({
    value: props.value ?? 0,
    min: 0,
    max: props.sensor?.max || 100,
    unit: props.sensor?.unit || '',
    thresholds: props.sensor?.thresholds || {},
  }),
)
</script>
