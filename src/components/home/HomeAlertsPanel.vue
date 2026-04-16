<template>
  <Card class="flex flex-col h-full">
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="text-sm font-medium">Активные уведомления</CardTitle>
          <p class="text-xs text-muted-foreground mt-1">Неподтверждённые события от оборудования</p>
        </div>
        <Button variant="ghost" size="sm" as-child>
          <RouterLink :to="{ name: 'alerts' }">Все →</RouterLink>
        </Button>
      </div>
    </CardHeader>
    <CardContent class="p-0 flex-1 overflow-y-auto">
      <div class="divide-y divide-border">
        <RouterLink
          v-for="alert in visibleAlerts"
          :key="alert.id"
          :to="{ name: 'equipment-detail', params: { id: alert.equipmentId } }"
          class="flex items-start gap-3 px-6 py-3 hover:bg-accent/50 transition-colors"
        >
          <span
            class="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-md"
            :class="iconWrapClass(alert)"
          >
            <component :is="iconFor(alert)" class="h-4 w-4" />
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium truncate">{{ alert.title }}</span>
              <Badge variant="outline" class="text-xs shrink-0">
                {{ alert.equipmentId }}
              </Badge>
            </div>
            <div class="text-xs text-muted-foreground mt-0.5 truncate">
              {{ alert.description }}
            </div>
            <div class="text-[10px] text-muted-foreground/80 mt-1 metric-value">
              {{ alert.timestamp }}
            </div>
          </div>
        </RouterLink>

        <div v-if="visibleAlerts.length === 0" class="px-6 py-10 text-center">
          <CheckCircle2 class="w-8 h-8 mx-auto mb-3 text-status-success/50" />
          <div class="text-sm text-muted-foreground">Нет активных уведомлений</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { AlertTriangle, AlertOctagon, Info, CheckCircle2 } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAlertsStore } from '@/stores/alerts'

const alertsStore = useAlertsStore()

onMounted(() => {
  if (!alertsStore.alerts.length) alertsStore.fetchAlerts()
})

const visibleAlerts = computed(() => alertsStore.alerts.filter((a) => !a.acknowledged).slice(0, 8))

function iconFor(alert) {
  if (alert.type === 'critical') return AlertOctagon
  if (alert.type === 'warning') return AlertTriangle
  return Info
}

function iconWrapClass(alert) {
  if (alert.type === 'critical') return 'bg-status-critical-bg text-status-critical'
  if (alert.type === 'warning') return 'bg-status-warning-bg text-status-warning'
  return 'bg-status-info-bg text-status-info'
}
</script>
