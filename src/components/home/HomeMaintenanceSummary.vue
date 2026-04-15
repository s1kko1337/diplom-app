<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card class="border-status-critical/30 bg-status-critical-bg/30">
      <CardHeader class="pb-2">
        <CardTitle class="text-xs text-status-critical flex items-center gap-2">
          <AlertTriangle class="h-3.5 w-3.5" />
          Просрочено
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="metric-value text-3xl font-bold text-status-critical">{{ overdue }}</div>
        <p class="text-xs text-muted-foreground mt-1">единиц</p>
      </CardContent>
    </Card>

    <Card class="border-status-warning/30 bg-status-warning-bg/30">
      <CardHeader class="pb-2">
        <CardTitle class="text-xs text-status-warning flex items-center gap-2">
          <Clock class="h-3.5 w-3.5" />
          Срочно
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="metric-value text-3xl font-bold text-status-warning">{{ urgent }}</div>
        <p class="text-xs text-muted-foreground mt-1">&lt; 100 ч</p>
      </CardContent>
    </Card>

    <Card class="border-status-info/30 bg-status-info-bg/30">
      <CardHeader class="pb-2">
        <CardTitle class="text-xs text-status-info flex items-center gap-2">
          <Wrench class="h-3.5 w-3.5" />
          В работе
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="metric-value text-3xl font-bold text-status-info">{{ inProgressCount }}</div>
        <p class="text-xs text-muted-foreground mt-1">нарядов</p>
      </CardContent>
    </Card>

    <Card class="border-status-maintenance/30 bg-status-maintenance-bg/30">
      <CardHeader class="pb-2">
        <CardTitle class="text-xs text-status-maintenance flex items-center gap-2">
          <ClipboardCheck class="h-3.5 w-3.5" />
          На приёмке
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="metric-value text-3xl font-bold text-status-maintenance">
          {{ reviewCount }}
        </div>
        <p class="text-xs text-muted-foreground mt-1">нарядов</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { AlertTriangle, Clock, Wrench, ClipboardCheck } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useEquipmentStore } from '@/stores/equipment'
import { useMaintenanceStore } from '@/stores/maintenance'

const equipmentStore = useEquipmentStore()
const maintenanceStore = useMaintenanceStore()

onMounted(() => {
  if (!maintenanceStore.orders.length) {
    maintenanceStore.loadOrders().catch(() => {})
  }
})

const upcoming = computed(() =>
  equipmentStore.list
    .map((eq) => {
      const next = maintenanceStore.getNextMaintenance(eq.id)
      return next ? { equipmentId: eq.id, ...next } : null
    })
    .filter(Boolean),
)

const overdue = computed(() => upcoming.value.filter((u) => u.hoursRemaining <= 0).length)
const urgent = computed(
  () => upcoming.value.filter((u) => u.hoursRemaining > 0 && u.hoursRemaining < 100).length,
)

const inProgressCount = computed(
  () => maintenanceStore.orders.filter((o) => o.status === 'in_progress').length,
)
const reviewCount = computed(
  () => maintenanceStore.orders.filter((o) => o.status === 'review').length,
)
</script>
