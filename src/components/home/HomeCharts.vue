<template>
  <div v-if="equipmentId" class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>Температура двигателя ({{ equipmentId }})</CardDescription>
      </CardHeader>
      <CardContent>
        <v-chart :option="tempOption" autoresize style="width: 100%; height: 80px" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>Вибрация ({{ equipmentId }})</CardDescription>
      </CardHeader>
      <CardContent>
        <v-chart :option="vibrationOption" autoresize style="width: 100%; height: 80px" />
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { useChartColors } from '@/composables/useChartColors'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

defineProps({
  equipmentId: { type: String, default: null },
})

const { colors } = useChartColors()

function generateTrend(base, variance, count = 24) {
  return Array.from(
    { length: count },
    () => +(base + (Math.random() - 0.5) * variance * 2).toFixed(1),
  )
}

const tempData = generateTrend(78, 6)
const vibrationData = generateTrend(0.8, 0.3)

function makeSparklineOption(data, color) {
  const c = colors.value
  return {
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.surface2,
      borderColor: c.border,
      borderRadius: 4,
      textStyle: { fontFamily: 'JetBrains Mono', fontSize: 11, color: c.foreground },
    },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color + '40' },
              { offset: 1, color: color + '05' },
            ],
          },
        },
      },
    ],
  }
}

const tempOption = computed(() => makeSparklineOption(tempData, colors.value.chart1))
const vibrationOption = computed(() => makeSparklineOption(vibrationData, colors.value.chart4))
</script>
