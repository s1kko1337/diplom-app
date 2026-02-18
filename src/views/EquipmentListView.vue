<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl">СПИСОК ОБОРУДОВАНИЯ</h2>
        <div class="text-sm opacity-50 mt-1">Весь парк бурового оборудования</div>
      </div>
      <div class="bg-surface-1 border-2 border-border px-6 py-3">
        <div class="text-xs opacity-70 mb-1">АКТИВНО</div>
        <div class="metric-value text-2xl">{{ activeCount }}/{{ equipment.length }}</div>
      </div>
    </div>

    <!-- Поиск и фильтры -->
    <div class="flex items-center gap-4">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ПОИСК ПО ID ИЛИ МОДЕЛИ..."
          class="w-full pl-12 pr-4 py-3 bg-surface-1 border-2 border-border text-sm"
        />
      </div>
      <button
        class="flex items-center gap-2 px-4 py-3 border-2 border-border hover:bg-surface-2 transition-all duration-150"
      >
        <Filter class="w-4 h-4" />
        <span class="text-sm">ФИЛЬТРЫ</span>
      </button>
    </div>

    <!-- Фильтры статуса -->
    <div class="flex items-center gap-2">
      <button
        v-for="tab in statusTabs"
        :key="tab.key"
        class="px-4 py-2 text-sm transition-all duration-150"
        :class="
          activeTab === tab.key
            ? 'border-2 border-primary bg-surface-2'
            : 'border border-border hover:bg-surface-2'
        "
        @click="activeTab = tab.key"
      >
        {{ tab.label }} ({{ tab.count }})
      </button>
    </div>

    <!-- Сетка оборудования -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <RouterLink
        v-for="item in filteredEquipment"
        :key="item.name"
        :to="{ name: 'equipment-detail', params: { id: item.name } }"
        class="cursor-pointer"
      >
        <EquipmentCard
          :name="item.name"
          :equipment-id="item.id"
          :is-active="item.isActive"
          :status="item.status"
        />
      </RouterLink>
    </div>

    <!-- Детальная таблица -->
    <div class="bg-surface-1 border-2 border-border">
      <div class="p-4 border-b-2 border-border">
        <label class="text-xs">ДЕТАЛЬНАЯ ИНФОРМАЦИЯ</label>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left p-4"><div class="text-xs opacity-70">ID</div></th>
              <th class="text-left p-4"><div class="text-xs opacity-70">МОДЕЛЬ</div></th>
              <th class="text-right p-4"><div class="text-xs opacity-70">ГЛУБИНА (М)</div></th>
              <th class="text-right p-4"><div class="text-xs opacity-70">СКОРОСТЬ (RPM)</div></th>
              <th class="text-right p-4"><div class="text-xs opacity-70">ВРЕМЯ РАБОТЫ (Ч)</div></th>
              <th class="text-left p-4"><div class="text-xs opacity-70">СТАТУС</div></th>
              <th class="text-left p-4"><div class="text-xs opacity-70">ДЕЙСТВИЯ</div></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredEquipment"
              :key="item.name"
              class="border-b border-border hover:bg-surface-2 transition-all duration-150"
            >
              <td class="p-4 metric-value text-sm">{{ item.name }}</td>
              <td class="p-4 text-sm">{{ item.id }}</td>
              <td class="p-4 metric-value text-sm text-right">
                {{ getStatusValue(item, 'Глубина') }}
              </td>
              <td class="p-4 metric-value text-sm text-right">
                {{ getStatusValue(item, 'Скорость') }}
              </td>
              <td class="p-4 metric-value text-sm text-right">{{ item.hours }}</td>
              <td class="p-4 text-sm">
                <span
                  class="px-2 py-1 text-xs border"
                  :class="item.isActive ? 'border-primary' : 'border-border opacity-50'"
                >
                  {{ getStatusValue(item, 'Статус') }}
                </span>
              </td>
              <td class="p-4">
                <RouterLink
                  :to="{ name: 'equipment-detail', params: { id: item.name } }"
                  class="px-3 py-1 border border-border hover:bg-surface-2 text-xs transition-all duration-150"
                >
                  ДЕТАЛИ
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, Filter } from 'lucide-vue-next'
import EquipmentCard from '@/components/EquipmentCard.vue'

const searchQuery = ref('')
const activeTab = ref('all')

const equipment = [
  {
    name: 'БУР-12',
    id: 'СБШ-250МНА',
    isActive: true,
    hours: '8.2',
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
    hours: '6.5',
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
    hours: '0.0',
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
    hours: '3.1',
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
    hours: '7.8',
    status: [
      { label: 'Глубина', value: '29.4м', status: 'active' },
      { label: 'Скорость', value: '2220', status: 'active' },
      { label: 'Статус', value: 'РАБОТА', status: 'active' },
    ],
  },
  {
    name: 'БУР-17',
    id: 'СБШ-250МНА',
    isActive: true,
    hours: '5.4',
    status: [
      { label: 'Глубина', value: '41.2м', status: 'active' },
      { label: 'Скорость', value: '2290', status: 'active' },
      { label: 'Статус', value: 'РАБОТА', status: 'active' },
    ],
  },
  {
    name: 'БУР-05',
    id: 'DML-1200',
    isActive: false,
    hours: '0.0',
    status: [
      { label: 'Глубина', value: '48.9м', status: 'warning' },
      { label: 'Скорость', value: '0', status: 'warning' },
      { label: 'Статус', value: 'ОБСЛУЖИВАНИЕ', status: 'warning' },
    ],
  },
  {
    name: 'БУР-19',
    id: 'СБШ-320',
    isActive: true,
    hours: '9.1',
    status: [
      { label: 'Глубина', value: '55.7м', status: 'active' },
      { label: 'Скорость', value: '2420', status: 'active' },
      { label: 'Статус', value: 'РАБОТА', status: 'active' },
    ],
  },
]

const activeCount = computed(() => equipment.filter((e) => e.isActive).length)

const statusTabs = computed(() => [
  { key: 'all', label: 'ВСЕ', count: equipment.length },
  {
    key: 'work',
    label: 'РАБОТА',
    count: equipment.filter((e) => getStatusValue(e, 'Статус') === 'РАБОТА').length,
  },
  {
    key: 'idle',
    label: 'ПРОСТОЙ',
    count: equipment.filter((e) => getStatusValue(e, 'Статус') === 'ПРОСТОЙ').length,
  },
  {
    key: 'maintenance',
    label: 'ОБСЛУЖИВАНИЕ',
    count: equipment.filter((e) => getStatusValue(e, 'Статус') === 'ОБСЛУЖИВАНИЕ').length,
  },
  {
    key: 'error',
    label: 'АВАРИЯ',
    count: equipment.filter((e) => getStatusValue(e, 'Статус') === 'АВАРИЯ').length,
  },
])

function getStatusValue(item, label) {
  return item.status.find((s) => s.label === label)?.value || ''
}

const statusMap = { work: 'РАБОТА', idle: 'ПРОСТОЙ', maintenance: 'ОБСЛУЖИВАНИЕ', error: 'АВАРИЯ' }

const filteredEquipment = computed(() => {
  let result = equipment
  if (activeTab.value !== 'all') {
    result = result.filter((e) => getStatusValue(e, 'Статус') === statusMap[activeTab.value])
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toUpperCase()
    result = result.filter(
      (e) => e.name.toUpperCase().includes(q) || e.id.toUpperCase().includes(q),
    )
  }
  return result
})
</script>

<style scoped></style>
