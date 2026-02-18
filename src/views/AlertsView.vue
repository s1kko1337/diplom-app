<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl">АЛЕРТЫ И УВЕДОМЛЕНИЯ</h2>
        <div class="text-sm opacity-50 mt-1">Системные уведомления о состоянии оборудования</div>
      </div>
      <div class="flex items-center gap-4">
        <div class="bg-surface-1 border-2 border-border px-6 py-3">
          <div class="text-xs opacity-70 mb-1">ВСЕГО АКТИВНЫХ</div>
          <div class="metric-value text-2xl">{{ unacknowledgedCount }}</div>
        </div>
        <div
          v-if="criticalCount > 0"
          class="bg-status-critical-bg text-status-critical-text border-2 border-primary px-6 py-3 animate-pulse"
        >
          <div class="text-xs opacity-70 mb-1">КРИТИЧЕСКИХ</div>
          <div class="metric-value text-2xl">{{ criticalCount }}</div>
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="flex items-center gap-2">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        class="px-4 py-2 text-sm transition-all duration-150"
        :class="
          activeFilter === tab.key
            ? 'border-2 border-primary bg-surface-2'
            : 'border border-border hover:bg-surface-2'
        "
        @click="activeFilter = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Список алертов -->
    <div class="space-y-4">
      <div
        v-for="alert in filteredAlerts"
        :key="alert.id"
        class="border-2 p-6 transition-all duration-150 hover:translate-x-0.5 hover:-translate-y-0.5"
        :class="getAlertStyle(alert)"
        :style="{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4 flex-1">
            <div class="mt-1">
              <component :is="alertIcons[alert.type]" class="w-5 h-5" />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-base">{{ alert.title }}</h3>
                <span class="metric-value text-xs px-2 py-1 border border-current">{{
                  alert.equipment
                }}</span>
                <span
                  v-if="alert.acknowledged"
                  class="text-xs px-2 py-1 border border-border opacity-50"
                  >ПОДТВЕРЖДЕНО</span
                >
              </div>
              <p class="text-sm opacity-80 mb-3">{{ alert.description }}</p>
              <div class="flex items-center gap-4 text-xs opacity-50">
                <span class="metric-value">ID: {{ alert.id }}</span>
                <span class="metric-value">{{ alert.timestamp }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 ml-4">
            <button
              v-if="!alert.acknowledged"
              class="px-4 py-2 border border-current hover:bg-surface-2 text-sm transition-all duration-150"
            >
              ПОДТВЕРДИТЬ
            </button>
            <button
              class="p-2 border border-current hover:bg-surface-2 transition-all duration-150"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t-2 border-border">
      <div v-for="stat in stats" :key="stat.label" class="bg-surface-1 border-2 border-border p-4">
        <div class="text-xs opacity-70 mb-2">{{ stat.label }}</div>
        <div class="metric-value text-3xl">{{ stat.count }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-vue-next'

const activeFilter = ref('all')

const alertIcons = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle,
}

const alerts = [
  {
    id: 'A-001',
    type: 'critical',
    title: 'КРИТИЧЕСКАЯ ТЕМПЕРАТУРА',
    description: 'Температура двигателя превысила допустимый предел 95°C',
    equipment: 'БУР-03',
    timestamp: '2026-02-16 14:23:45',
    acknowledged: false,
  },
  {
    id: 'A-002',
    type: 'warning',
    title: 'ПОВЫШЕННАЯ ВИБРАЦИЯ',
    description: 'Уровень вибрации превышает нормальные показатели',
    equipment: 'БУР-12',
    timestamp: '2026-02-16 13:45:12',
    acknowledged: false,
  },
  {
    id: 'A-003',
    type: 'warning',
    title: 'ИЗНОС ИНСТРУМЕНТА',
    description: 'Износ долота достиг 75%, рекомендуется замена',
    equipment: 'БУР-08',
    timestamp: '2026-02-16 12:30:00',
    acknowledged: true,
  },
  {
    id: 'A-004',
    type: 'info',
    title: 'ПЛАНОВОЕ ОБСЛУЖИВАНИЕ',
    description: 'Приближается срок планового технического обслуживания',
    equipment: 'БУР-15',
    timestamp: '2026-02-16 10:15:30',
    acknowledged: true,
  },
  {
    id: 'A-005',
    type: 'success',
    title: 'ОБСЛУЖИВАНИЕ ЗАВЕРШЕНО',
    description: 'Плановое ТО успешно выполнено',
    equipment: 'БУР-21',
    timestamp: '2026-02-16 09:00:00',
    acknowledged: true,
  },
  {
    id: 'A-006',
    type: 'warning',
    title: 'НИЗКИЙ УРОВЕНЬ ТОПЛИВА',
    description: 'Уровень топлива ниже 25%',
    equipment: 'БУР-03',
    timestamp: '2026-02-16 08:45:22',
    acknowledged: true,
  },
]

const filterTabs = [
  { key: 'all', label: 'ВСЕ' },
  { key: 'critical', label: 'КРИТИЧЕСКИЕ' },
  { key: 'warning', label: 'ПРЕДУПРЕЖДЕНИЯ' },
  { key: 'info', label: 'ИНФОРМАЦИЯ' },
  { key: 'unacknowledged', label: 'НЕПОДТВЕРЖДЁННЫЕ' },
]

const unacknowledgedCount = computed(() => alerts.filter((a) => !a.acknowledged).length)
const criticalCount = computed(
  () => alerts.filter((a) => a.type === 'critical' && !a.acknowledged).length,
)

const filteredAlerts = computed(() => {
  if (activeFilter.value === 'all') return alerts
  if (activeFilter.value === 'unacknowledged') return alerts.filter((a) => !a.acknowledged)
  return alerts.filter((a) => a.type === activeFilter.value)
})

function getAlertStyle(alert) {
  if (alert.acknowledged) return 'bg-surface-1 border-border opacity-60'
  const map = {
    critical: 'bg-status-critical-bg text-status-critical-text border-primary animate-pulse',
    warning: 'bg-surface-2 border-primary',
    info: 'bg-surface-1 border-border',
    success: 'bg-surface-1 border-border',
  }
  return map[alert.type]
}

const stats = computed(() => [
  { label: 'КРИТИЧЕСКИЕ', count: alerts.filter((a) => a.type === 'critical').length },
  { label: 'ПРЕДУПРЕЖДЕНИЯ', count: alerts.filter((a) => a.type === 'warning').length },
  { label: 'ИНФОРМАЦИЯ', count: alerts.filter((a) => a.type === 'info').length },
  { label: 'УСПЕШНО', count: alerts.filter((a) => a.type === 'success').length },
])
</script>

<style scoped></style>
