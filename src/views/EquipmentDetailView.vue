<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <RouterLink
          to="/equipment"
          class="p-3 border-2 border-border hover:bg-surface-2 transition-all duration-150"
        >
          <ArrowLeft class="w-5 h-5" />
        </RouterLink>
        <div>
          <h2 class="text-2xl">БУР-12</h2>
          <div class="metric-value text-sm opacity-50 mt-1">
            Буровой станок СБШ-250МНА &bull; ID: E-2024-012
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-4 py-2 border-2 border-primary">
          <div class="w-2 h-2 bg-primary animate-pulse" />
          <span class="text-xs">РАБОТА</span>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-3 border-2 border-border hover:bg-surface-2 transition-all duration-150"
        >
          <Pause class="w-5 h-5" />
          <span class="text-sm">ОСТАНОВИТЬ</span>
        </button>
      </div>
    </div>

    <!-- Основные метрики -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <MetricCard title="СКОРОСТЬ ВРАЩЕНИЯ" value="2,340" unit="RPM" trend="up" status="normal" />
      <MetricCard title="ГЛУБИНА" value="45.3" unit="М" trend="up" status="normal" />
      <MetricCard title="ТЕМПЕРАТУРА" value="82" unit="°C" trend="up" status="warning" />
      <MetricCard title="ДАВЛЕНИЕ" value="124" unit="БАР" trend="neutral" status="normal" />
      <MetricCard title="ВРЕМЯ РАБОТЫ" value="6.5" unit="ЧАС" trend="up" status="normal" />
    </div>

    <!-- Графики -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartWidget title="МОЩНОСТЬ (%)" :data="powerData" unit="%" :height="280" />
      <ChartWidget title="ГЛУБИНА БУРЕНИЯ (М)" :data="depthData" unit="м" :height="280" />
    </div>
    <div class="grid grid-cols-1 gap-6">
      <ChartWidget title="КРУТЯЩИЙ МОМЕНТ (Нм)" :data="torqueData" unit="Нм" :height="280" />
    </div>

    <!-- Детальные показатели -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatusIndicator label="ЗАГРУЗКА ДВИГАТЕЛЯ" :value="87" :max="100" status="normal" />
      <StatusIndicator label="РАСХОД ТОПЛИВА" :value="18.5" :max="25" unit="Л/Ч" status="normal" />
      <StatusIndicator label="ИЗНОС ДОЛОТА" :value="62" :max="100" status="warning" />
      <StatusIndicator label="УРОВЕНЬ МАСЛА" :value="94" :max="100" status="normal" />
      <StatusIndicator
        label="ДАВЛЕНИЕ ГИДРОСИСТЕМЫ"
        :value="124"
        :max="150"
        unit="БАР"
        status="normal"
      />
      <StatusIndicator
        label="ТЕМПЕРАТУРА ГИДРОМАСЛА"
        :value="58"
        :max="80"
        unit="°C"
        status="normal"
      />
    </div>

    <!-- Техническая информация -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-surface-1 border-2 border-border p-6">
        <label class="text-xs mb-4 block">ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ</label>
        <div class="space-y-3">
          <div v-for="spec in specs" :key="spec.label" class="flex justify-between text-sm">
            <span class="opacity-70">{{ spec.label }}</span>
            <span class="metric-value">{{ spec.value }}</span>
          </div>
        </div>
      </div>

      <div class="bg-surface-1 border-2 border-border p-6">
        <label class="text-xs mb-4 block">ИСТОРИЯ ОБСЛУЖИВАНИЯ</label>
        <div class="space-y-4">
          <div
            v-for="item in serviceHistory"
            :key="item.date"
            class="pb-3 border-b border-border last:border-0"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="text-sm">{{ item.type }}</div>
                <div class="metric-value text-xs opacity-50 mt-1">{{ item.date }}</div>
              </div>
              <div class="text-xs px-2 py-1 border border-border">{{ item.status }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ArrowLeft, Pause } from 'lucide-vue-next'
import MetricCard from '@/components/MetricCard.vue'
import ChartWidget from '@/components/ChartWidget.vue'
import StatusIndicator from '@/components/StatusIndicator.vue'

const powerData = Array.from({ length: 48 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
  value: +(80 + Math.random() * 20).toFixed(1),
}))

const depthData = Array.from({ length: 48 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
  value: +(40 + i * 0.2 + Math.random() * 2).toFixed(1),
}))

const torqueData = Array.from({ length: 48 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
  value: +(320 + Math.random() * 40).toFixed(0),
}))

const specs = [
  { label: 'Модель', value: 'СБШ-250МНА' },
  { label: 'Серийный номер', value: 'SN-2024-0812' },
  { label: 'Год выпуска', value: '2023' },
  { label: 'Макс. глубина бурения', value: '250 м' },
  { label: 'Диаметр бурения', value: '76-250 мм' },
  { label: 'Мощность двигателя', value: '132 кВт' },
  { label: 'Макс. крутящий момент', value: '400 Нм' },
]

const serviceHistory = [
  { date: '2026-02-10', type: 'Плановое ТО', status: 'Завершено' },
  { date: '2026-01-28', type: 'Замена долота', status: 'Завершено' },
  { date: '2026-01-15', type: 'Диагностика', status: 'Завершено' },
  { date: '2025-12-20', type: 'Плановое ТО', status: 'Завершено' },
]
</script>

<style scoped></style>
