<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-medium">Производительность по месяцам</CardTitle>
      </CardHeader>
      <CardContent>
        <v-chart :option="barChartOption" style="height: 300px" autoresize />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-medium">Статус оборудования</CardTitle>
      </CardHeader>
      <CardContent>
        <v-chart :option="pieChartOption" style="height: 200px" autoresize />
        <div class="mt-4 space-y-2">
          <div
            v-for="item in statusData"
            :key="item.name"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-sm" :style="{ backgroundColor: item.color }" />
              <span class="text-xs text-muted-foreground">{{ item.name }}</span>
            </div>
            <span class="metric-value text-xs">{{ item.value }}</span>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <div class="text-xs font-medium text-muted-foreground">Состояние подсистем</div>
          <div v-for="sub in subsystemHealth" :key="sub.id" class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span>{{ sub.label }}</span>
              <span class="metric-value">{{ sub.value }}%</span>
            </div>
            <div class="h-2 rounded-full bg-muted">
              <div
                class="h-full rounded-full transition-all"
                :class="
                  sub.value >= 80
                    ? 'bg-status-success'
                    : sub.value >= 60
                      ? 'bg-status-warning'
                      : 'bg-status-critical'
                "
                :style="{ width: sub.value + '%' }"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useChartColors } from '@/composables/useChartColors'
import { useChartOptions } from '@/composables/useChartOptions'
import { SUBSYSTEMS } from '@/utils/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

use([BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps({
  equipment: { type: Array, required: true },
  period: { type: String, required: true },
})

const { colors } = useChartColors()
const { barOption, pieOption } = useChartOptions()

const productivityData = [
  { month: 'ЯНВ', depth: 1234 },
  { month: 'ФЕВ', depth: 1456 },
  { month: 'МАР', depth: 1389 },
  { month: 'АПР', depth: 1512 },
  { month: 'МАЙ', depth: 1645 },
  { month: 'ИЮН', depth: 1578 },
]

const statusData = computed(() => {
  const working = props.equipment.filter((e) => e.status === 'working').length
  const idle = props.equipment.filter((e) => e.status === 'idle').length
  const offline = props.equipment.filter((e) => e.status === 'offline').length
  const malfunction = props.equipment.filter((e) => e.status === 'malfunction').length
  const c = colors.value
  return [
    { name: 'Работа', value: working, color: c.chart1 },
    { name: 'Простой', value: idle, color: c.chart5 },
    { name: 'Отключено', value: offline, color: c.chart4 },
    { name: 'Авария', value: malfunction, color: c.chart3 },
  ]
})

const subsystemHealth = computed(() =>
  SUBSYSTEMS.map((sub) => {
    const total = props.equipment.length || 1
    const working = props.equipment.filter((e) => e.status === 'working').length
    const base = Math.round((working / total) * 100)
    const offset = sub.id.charCodeAt(0) % 10
    return {
      id: sub.id,
      label: sub.label,
      value: Math.min(100, Math.max(40, base + offset - 3)),
    }
  }),
)

const barChartOption = computed(() =>
  barOption({
    categories: productivityData.map((d) => d.month),
    values: productivityData.map((d) => d.depth),
    color: colors.value.chart1,
  }),
)

const pieChartOption = computed(() =>
  pieOption({
    data: statusData.value.map((d) => ({
      name: d.name,
      value: d.value,
      itemStyle: { color: d.color },
    })),
  }),
)
</script>
