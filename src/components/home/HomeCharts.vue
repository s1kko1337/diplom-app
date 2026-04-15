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
import { useChartOptions } from '@/composables/useChartOptions'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

defineProps({
  equipmentId: { type: String, default: null },
})

const { colors } = useChartColors()
const { lineOption } = useChartOptions()

function generateTrend(base, variance, count = 24) {
  return Array.from(
    { length: count },
    () => +(base + (Math.random() - 0.5) * variance * 2).toFixed(1),
  )
}

const tempData = generateTrend(78, 6)
const vibrationData = generateTrend(0.8, 0.3)

const tempOption = computed(() =>
  lineOption({
    categories: tempData.map((_, i) => i),
    values: tempData,
    color: colors.value.chart1,
    sparkline: true,
  }),
)

const vibrationOption = computed(() =>
  lineOption({
    categories: vibrationData.map((_, i) => i),
    values: vibrationData,
    color: colors.value.chart4,
    sparkline: true,
  }),
)
</script>
