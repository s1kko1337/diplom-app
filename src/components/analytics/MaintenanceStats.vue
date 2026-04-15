<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-medium text-muted-foreground">Плановых ТО</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="metric-value text-4xl font-bold">12</div>
        <p class="text-sm text-muted-foreground mt-1">Выполнено в этом месяце</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-medium text-muted-foreground"
          >Внеплановых ремонтов</CardTitle
        >
      </CardHeader>
      <CardContent>
        <div class="metric-value text-4xl font-bold">5</div>
        <p class="text-sm text-muted-foreground mt-1">Случаев в этом месяце</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-medium text-muted-foreground">Трудозатраты</CardTitle>
      </CardHeader>
      <CardContent>
        <v-chart :option="laborChartOption" style="height: 200px" autoresize />
        <div class="mt-2 text-center">
          <span class="metric-value text-2xl font-bold">{{ totalLaborCost }}</span>
          <span class="text-sm text-muted-foreground ml-1">чел·ч</span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useChartColors } from '@/composables/useChartColors'
import { useChartOptions } from '@/composables/useChartOptions'
import { MAINTENANCE_SCHEDULE } from '@/utils/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const { colors } = useChartColors()
const { barOption, base } = useChartOptions()

const laborEntries = computed(() => {
  const counts = {
    'ТО-1': 79,
    'ТО-2': 39,
    'ТО-3': 9,
    'ТР-1': 7,
    'ТР-2': 3,
    'ТР-3': 1,
  }
  return Object.entries(counts).map(([type, count]) => ({
    type,
    count,
    cost: count * (MAINTENANCE_SCHEDULE[type]?.laborCost || 0),
  }))
})

const totalLaborCost = computed(() => laborEntries.value.reduce((sum, e) => sum + e.cost, 0))

const laborChartOption = computed(() => {
  const c = colors.value
  const categories = laborEntries.value.map((e) => e.type)
  const values = laborEntries.value.map((e) => e.cost)
  const chartColors = [c.chart1, c.chart2, c.chart3, c.chart4, c.chart5, c.foreground]
  const opts = barOption({ categories, values, color: c.chart1 })
  opts.series[0].data = values.map((v, i) => ({
    value: v,
    itemStyle: {
      color: chartColors[i % chartColors.length],
      borderRadius: [4, 4, 0, 0],
    },
  }))
  opts.tooltip = {
    ...base.value.tooltip,
    formatter(params) {
      const p = params[0]
      return `${p.name}: ${p.value} чел·ч`
    },
  }
  return opts
})
</script>
