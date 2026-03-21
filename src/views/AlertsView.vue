<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="alertsStore.loading && !alertsStore.alerts.length" />

    <template v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-semibold">Уведомления</h2>
          <div class="text-xs sm:text-sm text-muted-foreground mt-1">
            Системные уведомления о состоянии оборудования
          </div>
        </div>
        <div class="flex items-center gap-3 sm:gap-4">
          <Card class="px-4 sm:px-6 py-3">
            <div class="text-xs text-muted-foreground mb-1">ВСЕГО АКТИВНЫХ</div>
            <div class="metric-value text-xl sm:text-2xl">
              {{ alertsStore.unacknowledgedCount }}
            </div>
          </Card>
          <Card
            v-if="criticalCount > 0"
            class="px-4 sm:px-6 py-3 border-destructive bg-destructive/10 animate-pulse"
          >
            <div class="text-xs text-muted-foreground mb-1">КРИТИЧЕСКИХ</div>
            <div class="metric-value text-xl sm:text-2xl text-destructive">{{ criticalCount }}</div>
          </Card>
        </div>
      </div>

      <Tabs v-model="activeFilter" default-value="all">
        <TabsList>
          <TabsTrigger v-for="tab in filterTabs" :key="tab.key" :value="tab.key">
            {{ tab.label }} ({{ tab.count }})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div class="space-y-6">
        <div v-for="group in groupedAlerts" :key="group.date">
          <div class="flex items-center gap-3 mb-3">
            <div class="text-sm font-medium text-muted-foreground">{{ group.dateLabel }}</div>
            <div class="flex-1 border-t border-border" />
            <Badge variant="secondary" class="text-xs">
              {{ group.alerts.length }}
            </Badge>
          </div>

          <div class="space-y-3">
            <Transition v-for="alert in group.alerts" :key="alert.id" name="fade" appear>
              <Card
                :class="[
                  'transition-all duration-150',
                  alert.acknowledged ? 'opacity-60' : '',
                  getAlertBorderClass(alert),
                ]"
              >
                <CardContent class="p-4">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-3 flex-1 min-w-0">
                      <div class="mt-0.5 shrink-0">
                        <component
                          :is="alertIcons[alert.type]"
                          class="w-5 h-5"
                          :class="alertIconColor(alert.type)"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 class="text-sm font-medium">{{ alert.title }}</h3>
                          <Badge variant="outline" class="text-xs">
                            {{ alert.equipmentId }}
                          </Badge>
                          <Badge :variant="alertBadgeVariant(alert.type)" class="text-xs">
                            {{ alertTypeLabel(alert.type) }}
                          </Badge>
                          <Badge v-if="alert.acknowledged" variant="secondary" class="text-xs">
                            Подтверждено
                          </Badge>
                        </div>
                        <p class="text-sm text-muted-foreground mb-2">{{ alert.description }}</p>
                        <div class="flex items-center gap-3 text-xs text-muted-foreground">
                          <span class="metric-value">{{ alert.id }}</span>
                          <span class="metric-value">{{ formatTime(alert.timestamp) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <Button
                        v-if="!alert.acknowledged"
                        variant="outline"
                        size="sm"
                        class="min-h-[44px] sm:min-h-0"
                        @click="alertsStore.acknowledgeAlert(alert.id)"
                      >
                        Подтвердить
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                        @click="alertsStore.dismissAlert(alert.id)"
                      >
                        <X class="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Transition>
          </div>
        </div>

        <Card v-if="filteredAlerts.length === 0" class="text-center py-12">
          <CardContent class="pt-6">
            <Bell class="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
            <div class="text-sm text-muted-foreground">Нет уведомлений в данной категории</div>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-6 border-t border-border">
        <Card v-for="stat in stats" :key="stat.label" class="p-4">
          <div class="text-xs text-muted-foreground mb-2">{{ stat.label }}</div>
          <div class="metric-value text-3xl">{{ stat.count }}</div>
        </Card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AlertTriangle, AlertCircle, Info, CheckCircle, Wrench, X, Bell } from 'lucide-vue-next'
import { useAlertsStore } from '@/stores/alerts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  maintenance: Wrench,
}

function alertIconColor(type) {
  const map = {
    critical: 'text-destructive',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    success: 'text-green-500',
    maintenance: 'text-blue-500',
  }
  return map[type] || 'text-muted-foreground'
}

function alertBadgeVariant(type) {
  if (type === 'critical') return 'destructive'
  return 'secondary'
}

function alertTypeLabel(type) {
  const map = {
    critical: 'Критическое',
    warning: 'Предупреждение',
    info: 'Информация',
    success: 'Успешно',
    maintenance: 'Обслуживание',
  }
  return map[type] || type
}

function getAlertBorderClass(alert) {
  if (alert.acknowledged) return ''
  const map = {
    critical: 'border-destructive',
    warning: 'border-yellow-500',
    info: 'border-blue-500',
    success: 'border-green-500',
    maintenance: 'border-blue-400',
  }
  return map[alert.type] || ''
}

const criticalCount = computed(
  () => alertsStore.alerts.filter((a) => a.type === 'critical' && !a.acknowledged).length,
)

const filterTabs = computed(() => [
  { key: 'all', label: 'Все', count: alertsStore.alerts.length },
  {
    key: 'critical',
    label: 'Критические',
    count: alertsStore.alerts.filter((a) => a.type === 'critical').length,
  },
  {
    key: 'warning',
    label: 'Предупреждения',
    count: alertsStore.alerts.filter((a) => a.type === 'warning').length,
  },
  {
    key: 'maintenance',
    label: 'Обслуживание',
    count: alertsStore.alerts.filter((a) => a.type === 'maintenance').length,
  },
  {
    key: 'info',
    label: 'Информация',
    count: alertsStore.alerts.filter((a) => a.type === 'info').length,
  },
  {
    key: 'unacknowledged',
    label: 'Неподтверждённые',
    count: alertsStore.unacknowledgedCount,
  },
])

const filteredAlerts = computed(() => {
  if (activeFilter.value === 'all') return alertsStore.alerts
  if (activeFilter.value === 'unacknowledged')
    return alertsStore.alerts.filter((a) => !a.acknowledged)
  return alertsStore.alerts.filter((a) => a.type === activeFilter.value)
})

function parseDate(timestamp) {
  const d = new Date(timestamp)
  if (!isNaN(d.getTime())) return d
  const parts = timestamp.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/)
  if (parts) {
    return new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6])
  }
  return new Date()
}

function formatTime(timestamp) {
  const d = parseDate(timestamp)
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function dateKey(timestamp) {
  const d = parseDate(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateLabelFromKey(key) {
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  if (key === todayKey) return 'Сегодня'
  if (key === yesterdayKey) return 'Вчера'

  const [y, m, d] = key.split('-')
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const groupedAlerts = computed(() => {
  const groups = {}
  for (const alert of filteredAlerts.value) {
    const key = dateKey(alert.timestamp)
    if (!groups[key]) {
      groups[key] = { date: key, dateLabel: dateLabelFromKey(key), alerts: [] }
    }
    groups[key].alerts.push(alert)
  }
  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date))
})

const stats = computed(() => [
  { label: 'Критические', count: alertsStore.alerts.filter((a) => a.type === 'critical').length },
  {
    label: 'Предупреждения',
    count: alertsStore.alerts.filter((a) => a.type === 'warning').length,
  },
  {
    label: 'Обслуживание',
    count: alertsStore.alerts.filter((a) => a.type === 'maintenance').length,
  },
  { label: 'Информация', count: alertsStore.alerts.filter((a) => a.type === 'info').length },
  { label: 'Успешно', count: alertsStore.alerts.filter((a) => a.type === 'success').length },
])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
