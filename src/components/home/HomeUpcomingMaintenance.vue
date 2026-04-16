<template>
  <Card class="flex flex-col h-full">
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="text-sm font-medium">Ближайшие ТО</CardTitle>
          <p class="text-xs text-muted-foreground mt-1">
            По нарастающей наработке до следующего обслуживания
          </p>
        </div>
        <Button variant="ghost" size="sm" as-child>
          <RouterLink :to="{ name: 'maintenance' }">Все наряды →</RouterLink>
        </Button>
      </div>
    </CardHeader>
    <CardContent class="p-0 flex-1 overflow-y-auto">
      <div class="divide-y divide-border">
        <RouterLink
          v-for="item in sortedUpcoming"
          :key="item.equipmentId"
          :to="{ name: 'equipment-detail', params: { id: item.equipmentId } }"
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors"
        >
          <div class="shrink-0">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-md"
              :class="badgeClass(item)"
            >
              <Wrench class="h-4 w-4" />
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="metric-value text-sm font-medium">{{ item.equipmentId }}</span>
              <Badge variant="outline" class="text-xs">{{ item.type }}</Badge>
              <span class="text-xs text-muted-foreground truncate">
                {{ item.label || item.type }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <div class="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="progressBarClass(item)"
                  :style="{ width: progressPercent(item) + '%' }"
                />
              </div>
              <span class="metric-value text-xs text-muted-foreground whitespace-nowrap">
                {{ item.hoursRemaining }} ч
              </span>
            </div>
          </div>
        </RouterLink>

        <div v-if="sortedUpcoming.length === 0" class="px-6 py-8 text-center">
          <Wrench class="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
          <div class="text-sm text-muted-foreground">Нет запланированных ТО</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Wrench } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEquipmentStore } from '@/stores/equipment'
import { useMaintenanceStore } from '@/stores/maintenance'
import { MAINTENANCE_SCHEDULE } from '@/utils/constants'

const equipmentStore = useEquipmentStore()
const maintenanceStore = useMaintenanceStore()

const sortedUpcoming = computed(() =>
  equipmentStore.list
    .map((eq) => {
      const next = maintenanceStore.getNextMaintenance(eq.id)
      return next ? { equipmentId: eq.id, ...next } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.hoursRemaining - b.hoursRemaining)
    .slice(0, 6),
)

function severity(item) {
  if (item.hoursRemaining <= 0) return 'critical'
  if (item.hoursRemaining < 100) return 'warning'
  if (item.hoursRemaining < 500) return 'info'
  return 'normal'
}

function badgeClass(item) {
  const map = {
    critical: 'bg-status-critical-bg text-status-critical',
    warning: 'bg-status-warning-bg text-status-warning',
    info: 'bg-status-info-bg text-status-info',
    normal: 'bg-muted text-muted-foreground',
  }
  return map[severity(item)]
}

function progressBarClass(item) {
  const map = {
    critical: 'bg-status-critical',
    warning: 'bg-status-warning',
    info: 'bg-status-info',
    normal: 'bg-primary',
  }
  return map[severity(item)]
}

function progressPercent(item) {
  const scheduleEntry = MAINTENANCE_SCHEDULE[item.type]
  if (!scheduleEntry?.hours) return 0
  const passed = scheduleEntry.hours - item.hoursRemaining
  return Math.min(Math.max((passed / scheduleEntry.hours) * 100, 0), 100)
}
</script>
