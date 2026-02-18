<template>
  <div class="space-y-6">
    <!-- Метрики -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="СТАНОК №12"
        value="2,340"
        unit="RPM"
        trend="up"
        status="normal"
        subtitle="СБШ-250МНА"
      />
      <MetricCard
        title="ТЕМПЕРАТУРА"
        value="82"
        unit="°C"
        trend="up"
        status="warning"
        subtitle="В пределах нормы"
      />
      <MetricCard
        title="ГЛУБИНА БУРЕНИЯ"
        value="45.3"
        unit="М"
        trend="up"
        status="normal"
        subtitle="Целевая: 50м"
      />
      <MetricCard
        title="ДАВЛЕНИЕ"
        value="124"
        unit="БАР"
        trend="neutral"
        status="normal"
        subtitle="Номинальное"
      />
    </div>

    <!-- Графики -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartWidget title="ВИБРАЦИЯ (мм/с)" :data="vibrationData" unit="мм/с" :height="240" />
      <ChartWidget
        title="ТЕМПЕРАТУРА ДВИГАТЕЛЯ (°C)"
        :data="temperatureData"
        unit="°C"
        :height="240"
      />
    </div>

    <!-- Индикаторы состояния -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatusIndicator label="МОЩНОСТЬ" :value="87" :max="100" status="normal" />
      <StatusIndicator label="КРУТЯЩИЙ МОМЕНТ" :value="340" :max="400" unit="Нм" status="normal" />
      <StatusIndicator label="ИЗНОС ИНСТРУМЕНТА" :value="62" :max="100" status="warning" />
      <StatusIndicator label="РАСХОД ТОПЛИВА" :value="18.5" :max="25" unit="Л/Ч" status="normal" />
    </div>

    <!-- Карточки оборудования -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <EquipmentCard
        v-for="eq in equipmentCards"
        :key="eq.name"
        :name="eq.name"
        :equipment-id="eq.id"
        :is-active="eq.isActive"
        :status="eq.status"
      />
    </div>

    <!-- Таблица данных -->
    <DataTable :data="tableData" />
  </div>
</template>

<script setup>
import MetricCard from '@/components/MetricCard.vue'
import ChartWidget from '@/components/ChartWidget.vue'
import StatusIndicator from '@/components/StatusIndicator.vue'
import EquipmentCard from '@/components/EquipmentCard.vue'
import DataTable from '@/components/DataTable.vue'

const vibrationData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  value: +(0.5 + Math.random() * 0.8).toFixed(2),
}))

const temperatureData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  value: +(75 + Math.random() * 15).toFixed(1),
}))

const tableData = [
  {
    id: 'БУР-12',
    equipment: 'Буровой станок СБШ-250',
    depth: 45.3,
    speed: 2340,
    temperature: 82,
    status: 'РАБОТА',
  },
  {
    id: 'БУР-08',
    equipment: 'Буровой станок СБШ-250',
    depth: 38.7,
    speed: 2180,
    temperature: 78,
    status: 'РАБОТА',
  },
  {
    id: 'БУР-15',
    equipment: 'Буровой станок DML-1200',
    depth: 52.1,
    speed: 0,
    temperature: 45,
    status: 'ПРОСТОЙ',
  },
  {
    id: 'БУР-03',
    equipment: 'Буровой станок СБШ-320',
    depth: 61.8,
    speed: 2510,
    temperature: 95,
    status: 'АВАРИЯ',
  },
  {
    id: 'БУР-21',
    equipment: 'Буровой станок DML-1200',
    depth: 29.4,
    speed: 2220,
    temperature: 73,
    status: 'РАБОТА',
  },
]

const equipmentCards = [
  {
    name: 'БУР-12',
    id: 'СБШ-250МНА',
    isActive: true,
    status: [
      { label: 'Глубина', value: '45.3м', status: 'active' },
      { label: 'Скорость', value: '2340', status: 'active' },
      { label: 'Статус', value: 'РАБОТА', status: 'active' },
    ],
  },
  {
    name: 'БУР-08',
    id: 'СБШ-250МНА',
    isActive: true,
    status: [
      { label: 'Глубина', value: '38.7м', status: 'active' },
      { label: 'Скорость', value: '2180', status: 'active' },
      { label: 'Статус', value: 'РАБОТА', status: 'active' },
    ],
  },
  {
    name: 'БУР-15',
    id: 'DML-1200',
    isActive: false,
    status: [
      { label: 'Глубина', value: '52.1м', status: 'warning' },
      { label: 'Скорость', value: '0', status: 'warning' },
      { label: 'Статус', value: 'ПРОСТОЙ', status: 'warning' },
    ],
  },
  {
    name: 'БУР-03',
    id: 'СБШ-320',
    isActive: false,
    status: [
      { label: 'Глубина', value: '61.8м', status: 'error' },
      { label: 'Скорость', value: '2510', status: 'error' },
      { label: 'Статус', value: 'АВАРИЯ', status: 'error' },
    ],
  },
  {
    name: 'БУР-21',
    id: 'DML-1200',
    isActive: true,
    status: [
      { label: 'Глубина', value: '29.4м', status: 'active' },
      { label: 'Скорость', value: '2220', status: 'active' },
      { label: 'Статус', value: 'РАБОТА', status: 'active' },
    ],
  },
]
</script>

<style scoped></style>
