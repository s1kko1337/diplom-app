<template>
  <div class="h-full flex flex-col p-4">
    <div class="text-xs opacity-50 mb-2">ИСТОРИЧЕСКИЕ ДАННЫЕ — {{ sensorLabel }}</div>
    <div v-if="loading" class="flex-1 flex items-center justify-center text-sm opacity-30">
      ЗАГРУЗКА...
    </div>
    <div v-else-if="chartData.length" class="flex-1 min-h-0">
      <VChart :option="chartOption" autoresize class="w-full h-full" />
    </div>
    <div v-else class="flex-1 flex items-center justify-center text-sm opacity-30">НЕТ ДАННЫХ</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useChartColors } from '@/composables/useChartColors'
import { getHistory } from '@/api/sensors'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({
  title: { type: String, default: '' },
  sensor: { type: Object, default: null },
  equipmentId: { type: String, default: '' },
})

const { primaryColor, gridColor, textColor } = useChartColors()

const chartData = ref([])
const loading = ref(false)

const sensorLabel = computed(() => props.sensor?.label || props.title || '')

onMounted(async () => {
  if (!props.equipmentId || !props.sensor?.id) return
  loading.value = true
  try {
    const now = new Date()
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    chartData.value = await getHistory(props.equipmentId, props.sensor.id, {
      from,
      to: now.toISOString(),
    })
  } finally {
    loading.value = false
  }
})

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { top: 8, right: 8, bottom: 24, left: 40 },
  xAxis: {
    type: 'category',
    data: chartData.value.map((d) =>
      new Date(d.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    ),
    axisLine: { lineStyle: { color: gridColor.value } },
    axisLabel: { color: textColor.value, fontSize: 10 },
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: gridColor.value } },
    splitLine: { lineStyle: { color: gridColor.value } },
    axisLabel: { color: textColor.value, fontSize: 10 },
  },
  series: [
    {
      type: 'line',
      data: chartData.value.map((d) => d.value),
      smooth: true,
      showSymbol: false,
      lineStyle: { color: primaryColor.value, width: 2 },
      areaStyle: { color: primaryColor.value, opacity: 0.1 },
    },
  ],
}))
</script>
