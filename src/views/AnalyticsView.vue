<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl">АНАЛИТИКА И ОТЧЁТЫ</h2>
        <div class="text-sm opacity-50 mt-1">Статистика работы оборудования за период</div>
      </div>
      <div class="flex items-center gap-4">
        <button
          class="flex items-center gap-2 px-4 py-2 border border-border hover:bg-surface-2 transition-all duration-150"
        >
          <Calendar class="w-4 h-4" />
          <span class="text-sm">ПЕРИОД</span>
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 border-2 border-primary hover:bg-surface-2 transition-all duration-150"
        >
          <Download class="w-4 h-4" />
          <span class="text-sm">ЭКСПОРТ</span>
        </button>
      </div>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-surface-1 border-2 border-border p-6">
        <div class="text-xs opacity-70 mb-2">{{ kpi.label }}</div>
        <div class="flex items-baseline gap-2 mb-2">
          <div class="metric-value text-3xl">{{ kpi.value }}</div>
          <div class="text-lg opacity-60">{{ kpi.unit }}</div>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <component :is="kpi.trendUp ? TrendingUp : TrendingDown" class="w-4 h-4" />
          <span class="opacity-70">{{ kpi.change }}</span>
        </div>
      </div>
    </div>

    <!-- Графики -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-surface-1 border-2 border-border p-6">
        <label class="text-xs mb-4 block">ПРОИЗВОДИТЕЛЬНОСТЬ ПО МЕСЯЦАМ</label>
        <v-chart :option="barChartOption" style="height: 300px" autoresize />
      </div>

      <div class="bg-surface-1 border-2 border-border p-6">
        <label class="text-xs mb-4 block">СТАТУС ОБОРУДОВАНИЯ</label>
        <v-chart :option="pieChartOption" style="height: 300px" autoresize />
        <div class="mt-4 space-y-2">
          <div
            v-for="item in statusData"
            :key="item.name"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 border border-border" :style="{ backgroundColor: item.color }" />
              <span class="text-xs">{{ item.name }}</span>
            </div>
            <span class="metric-value text-xs">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Таблица эффективности -->
    <div class="bg-surface-1 border-2 border-border">
      <div class="p-4 border-b-2 border-border">
        <label class="text-xs">ЭФФЕКТИВНОСТЬ ОБОРУДОВАНИЯ</label>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left p-4"><div class="text-xs opacity-70">ОБОРУДОВАНИЕ</div></th>
              <th class="text-right p-4">
                <div class="text-xs opacity-70">ЭФФЕКТИВНОСТЬ (%)</div>
              </th>
              <th class="text-right p-4">
                <div class="text-xs opacity-70">ВРЕМЯ ПРОСТОЯ (%)</div>
              </th>
              <th class="text-left p-4"><div class="text-xs opacity-70">ВИЗУАЛИЗАЦИЯ</div></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in efficiencyData"
              :key="row.equipment"
              class="border-b border-border hover:bg-surface-2 transition-all duration-150"
            >
              <td class="p-4 text-sm">{{ row.equipment }}</td>
              <td class="p-4 metric-value text-sm text-right">{{ row.efficiency }}</td>
              <td class="p-4 metric-value text-sm text-right">{{ row.downtime }}</td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-surface-2 border border-border">
                    <div class="h-full bg-primary" :style="{ width: row.efficiency + '%' }" />
                  </div>
                  <span class="metric-value text-xs w-12 text-right">{{ row.efficiency }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Статистика обслуживания -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface-1 border-2 border-border p-6">
        <div class="text-xs opacity-70 mb-4">ПЛАНОВОЕ ОБСЛУЖИВАНИЕ</div>
        <div class="metric-value text-4xl mb-2">12</div>
        <div class="text-sm opacity-50">Выполнено в этом месяце</div>
      </div>
      <div class="bg-surface-1 border-2 border-border p-6">
        <div class="text-xs opacity-70 mb-4">ВНЕПЛАНОВЫЙ РЕМОНТ</div>
        <div class="metric-value text-4xl mb-2">5</div>
        <div class="text-sm opacity-50">Случаев в этом месяце</div>
      </div>
      <div class="bg-surface-1 border-2 border-border p-6">
        <div class="text-xs opacity-70 mb-4">ЗАТРАТЫ НА ОБСЛУЖИВАНИЕ</div>
        <div class="metric-value text-4xl mb-2">2.4М</div>
        <div class="text-sm opacity-50">Рублей за период</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-vue-next'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

import { useChartColors } from '@/composables/useChartColors'

const { colors } = useChartColors()

const kpis = [
  {
    label: 'ОБЩАЯ ГЛУБИНА',
    value: '8,814',
    unit: 'М',
    change: '+12.5% к прошлому периоду',
    trendUp: true,
  },
  {
    label: 'ВРЕМЯ РАБОТЫ',
    value: '4,328',
    unit: 'ЧАС',
    change: '+8.3% к прошлому периоду',
    trendUp: true,
  },
  {
    label: 'СРЕДНЯЯ ЭФФЕКТИВНОСТЬ',
    value: '88.2',
    unit: '%',
    change: '-2.1% к прошлому периоду',
    trendUp: false,
  },
  {
    label: 'АВАРИЙНЫЕ ОСТАНОВКИ',
    value: '7',
    unit: 'ШТ',
    change: '-30% к прошлому периоду',
    trendUp: false,
  },
]

const productivityData = [
  { month: 'ЯНВ', depth: 1234 },
  { month: 'ФЕВ', depth: 1456 },
  { month: 'МАР', depth: 1389 },
  { month: 'АПР', depth: 1512 },
  { month: 'МАЙ', depth: 1645 },
  { month: 'ИЮН', depth: 1578 },
]

const statusData = computed(() => [
  { name: 'РАБОТА', value: 12, color: colors.value.chart1 },
  { name: 'ПРОСТОЙ', value: 3, color: colors.value.chart5 },
  { name: 'ОБСЛУЖИВАНИЕ', value: 2, color: colors.value.chart4 },
  { name: 'АВАРИЯ', value: 1, color: colors.value.chart3 },
])

const efficiencyData = [
  { equipment: 'БУР-12', efficiency: 94, downtime: 6 },
  { equipment: 'БУР-08', efficiency: 91, downtime: 9 },
  { equipment: 'БУР-15', efficiency: 87, downtime: 13 },
  { equipment: 'БУР-03', efficiency: 76, downtime: 24 },
  { equipment: 'БУР-21', efficiency: 93, downtime: 7 },
]

const barChartOption = computed(() => {
  const c = colors.value
  return {
    grid: { left: 50, right: 20, top: 10, bottom: 30 },
    xAxis: {
      type: 'category',
      data: productivityData.map((d) => d.month),
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
      textStyle: { fontFamily: 'JetBrains Mono', color: c.foreground },
    },
    series: [
      {
        type: 'bar',
        data: productivityData.map((d) => d.depth),
        itemStyle: { color: c.foreground },
      },
    ],
  }
})

const pieChartOption = computed(() => {
  const c = colors.value
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: c.surface2,
      borderColor: c.border,
      borderRadius: 0,
      textStyle: { fontFamily: 'JetBrains Mono', color: c.foreground },
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: statusData.value.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
        label: { show: false },
        itemStyle: { borderColor: c.background, borderWidth: 2 },
      },
    ],
  }
})
</script>

<style scoped></style>
