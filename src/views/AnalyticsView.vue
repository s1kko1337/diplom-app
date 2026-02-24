<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl">АНАЛИТИКА И ОТЧЁТЫ</h2>
          <div class="text-sm opacity-50 mt-1">Статистика работы оборудования за период</div>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative">
            <button
              class="flex items-center gap-2 px-4 py-2 border transition-all duration-150"
              :class="
                showPeriodMenu ? 'border-primary bg-surface-2' : 'border-border hover:bg-surface-2'
              "
              @click="showPeriodMenu = !showPeriodMenu"
            >
              <Calendar class="w-4 h-4" />
              <span class="text-sm">{{ selectedPeriodLabel }}</span>
              <ChevronDown class="w-3 h-3 opacity-50" />
            </button>
            <div
              v-if="showPeriodMenu"
              class="absolute right-0 top-full mt-1 bg-surface-1 border-2 border-border z-10 min-w-48"
            >
              <button
                v-for="period in periods"
                :key="period.key"
                class="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-all duration-150"
                :class="
                  selectedPeriod === period.key ? 'bg-surface-2 border-l-2 border-primary' : ''
                "
                @click="selectPeriod(period.key)"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <button
            class="flex items-center gap-2 px-4 py-2 border-2 border-primary hover:bg-surface-2 transition-all duration-150"
            @click="exportNotice = true"
          >
            <Download class="w-4 h-4" />
            <span class="text-sm">ЭКСПОРТ</span>
          </button>
        </div>
      </div>

      <div
        v-if="exportNotice"
        class="flex items-center justify-between bg-surface-1 border-2 border-primary p-4"
      >
        <span class="text-sm"
          >Экспорт отчёта за период "{{ selectedPeriodLabel }}" будет доступен после интеграции с
          API</span
        >
        <button
          class="text-xs border border-border px-3 py-1 hover:bg-surface-2"
          @click="exportNotice = false"
        >
          ЗАКРЫТЬ
        </button>
      </div>

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
                <div
                  class="w-3 h-3 border border-border"
                  :style="{ backgroundColor: item.color }"
                />
                <span class="text-xs">{{ item.name }}</span>
              </div>
              <span class="metric-value text-xs">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>

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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Calendar, Download, TrendingUp, TrendingDown, ChevronDown } from 'lucide-vue-next'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useEquipmentStore } from '@/stores/equipment'
import { useChartColors } from '@/composables/useChartColors'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

use([BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const equipmentStore = useEquipmentStore()
const { colors } = useChartColors()

onMounted(() => {
  if (!equipmentStore.list.length) {
    equipmentStore.fetchList()
  }
})

const showPeriodMenu = ref(false)
const selectedPeriod = ref('6months')
const exportNotice = ref(false)

const periods = [
  { key: 'week', label: 'НЕДЕЛЯ' },
  { key: 'month', label: 'МЕСЯЦ' },
  { key: '3months', label: '3 МЕСЯЦА' },
  { key: '6months', label: '6 МЕСЯЦЕВ' },
  { key: 'year', label: 'ГОД' },
]

const selectedPeriodLabel = computed(
  () => periods.find((p) => p.key === selectedPeriod.value)?.label || 'ПЕРИОД',
)

function selectPeriod(key) {
  selectedPeriod.value = key
  showPeriodMenu.value = false
}

const kpis = computed(() => [
  {
    label: 'ВСЕГО ОБОРУДОВАНИЯ',
    value: String(equipmentStore.list.length),
    unit: 'ШТ',
    change: 'Весь парк',
    trendUp: true,
  },
  {
    label: 'В РАБОТЕ',
    value: String(equipmentStore.workingCount),
    unit: 'ШТ',
    change: `${Math.round((equipmentStore.workingCount / (equipmentStore.list.length || 1)) * 100)}% парка`,
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
    value: String(equipmentStore.malfunctionCount),
    unit: 'ШТ',
    change: 'Текущий статус',
    trendUp: false,
  },
])

const productivityData = [
  { month: 'ЯНВ', depth: 1234 },
  { month: 'ФЕВ', depth: 1456 },
  { month: 'МАР', depth: 1389 },
  { month: 'АПР', depth: 1512 },
  { month: 'МАЙ', depth: 1645 },
  { month: 'ИЮН', depth: 1578 },
]

const statusData = computed(() => [
  { name: 'РАБОТА', value: equipmentStore.workingCount, color: colors.value.chart1 },
  { name: 'ПРОСТОЙ', value: equipmentStore.idleCount, color: colors.value.chart5 },
  { name: 'ОТКЛЮЧЕНО', value: equipmentStore.offlineCount, color: colors.value.chart4 },
  { name: 'АВАРИЯ', value: equipmentStore.malfunctionCount, color: colors.value.chart3 },
])

const efficiencyData = computed(() =>
  equipmentStore.list.slice(0, 5).map((eq) => ({
    equipment: `${eq.id} (${eq.model})`,
    efficiency:
      eq.status === 'working'
        ? 85 + Math.round(Math.random() * 10)
        : eq.status === 'idle'
          ? 0
          : 40 + Math.round(Math.random() * 20),
    downtime:
      eq.status === 'working'
        ? 5 + Math.round(Math.random() * 10)
        : eq.status === 'idle'
          ? 100
          : 40 + Math.round(Math.random() * 20),
  })),
)

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
