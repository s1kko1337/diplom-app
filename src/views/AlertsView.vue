<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="alertsStore.loading && !alertsStore.alerts.length" />

    <template v-else>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl">АЛЕРТЫ И УВЕДОМЛЕНИЯ</h2>
          <div class="text-sm opacity-50 mt-1">Системные уведомления о состоянии оборудования</div>
        </div>
        <div class="flex items-center gap-4">
          <div class="bg-surface-1 border-2 border-border px-6 py-3">
            <div class="text-xs opacity-70 mb-1">ВСЕГО АКТИВНЫХ</div>
            <div class="metric-value text-2xl">{{ alertsStore.unacknowledgedCount }}</div>
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
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <div class="space-y-4">
        <TransitionGroup name="alert-list">
          <div
            v-for="alert in filteredAlerts"
            :key="alert.id"
            class="border-2 p-6 transition-all duration-150 hover:translate-x-0.5 hover:-translate-y-0.5"
            :class="getAlertStyle(alert)"
            :style="{
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
            }"
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
                      alert.equipmentId
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
                  @click="alertsStore.acknowledgeAlert(alert.id)"
                >
                  ПОДТВЕРДИТЬ
                </button>
                <button
                  class="p-2 border border-current hover:bg-surface-2 transition-all duration-150"
                  @click="alertsStore.dismissAlert(alert.id)"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <div
          v-if="filteredAlerts.length === 0"
          class="text-center py-12 opacity-50 border-2 border-border bg-surface-1"
        >
          <Bell class="w-8 h-8 mx-auto mb-3 opacity-30" />
          <div class="text-sm">НЕТ АЛЕРТОВ В ДАННОЙ КАТЕГОРИИ</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t-2 border-border">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-surface-1 border-2 border-border p-4"
        >
          <div class="text-xs opacity-70 mb-2">{{ stat.label }}</div>
          <div class="metric-value text-3xl">{{ stat.count }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AlertTriangle, AlertCircle, Info, CheckCircle, X, Bell } from 'lucide-vue-next'
import { useAlertsStore } from '@/stores/alerts'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const alertsStore = useAlertsStore()

onMounted(() => {
  if (!alertsStore.alerts.length) {
    alertsStore.fetchAlerts()
  }
})

const activeFilter = ref('all')

const alertIcons = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle,
}

const criticalCount = computed(
  () => alertsStore.alerts.filter((a) => a.type === 'critical' && !a.acknowledged).length,
)

const filterTabs = computed(() => [
  { key: 'all', label: 'ВСЕ', count: alertsStore.alerts.length },
  {
    key: 'critical',
    label: 'КРИТИЧЕСКИЕ',
    count: alertsStore.alerts.filter((a) => a.type === 'critical').length,
  },
  {
    key: 'warning',
    label: 'ПРЕДУПРЕЖДЕНИЯ',
    count: alertsStore.alerts.filter((a) => a.type === 'warning').length,
  },
  {
    key: 'info',
    label: 'ИНФОРМАЦИЯ',
    count: alertsStore.alerts.filter((a) => a.type === 'info').length,
  },
  {
    key: 'unacknowledged',
    label: 'НЕПОДТВЕРЖДЁННЫЕ',
    count: alertsStore.unacknowledgedCount,
  },
])

const filteredAlerts = computed(() => {
  if (activeFilter.value === 'all') return alertsStore.alerts
  if (activeFilter.value === 'unacknowledged')
    return alertsStore.alerts.filter((a) => !a.acknowledged)
  return alertsStore.alerts.filter((a) => a.type === activeFilter.value)
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
  { label: 'КРИТИЧЕСКИЕ', count: alertsStore.alerts.filter((a) => a.type === 'critical').length },
  { label: 'ПРЕДУПРЕЖДЕНИЯ', count: alertsStore.alerts.filter((a) => a.type === 'warning').length },
  { label: 'ИНФОРМАЦИЯ', count: alertsStore.alerts.filter((a) => a.type === 'info').length },
  { label: 'УСПЕШНО', count: alertsStore.alerts.filter((a) => a.type === 'success').length },
])
</script>

<style scoped>
.alert-list-enter-active,
.alert-list-leave-active {
  transition: all 0.3s ease;
}

.alert-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.alert-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
