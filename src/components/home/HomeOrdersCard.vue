<template>
  <Card class="flex flex-col h-full">
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="text-sm font-medium">{{ title }}</CardTitle>
          <p class="text-xs text-muted-foreground mt-1">{{ subtitle }}</p>
        </div>
        <Button variant="ghost" size="sm" as-child>
          <RouterLink :to="{ name: 'maintenance' }">Все наряды →</RouterLink>
        </Button>
      </div>
    </CardHeader>
    <CardContent class="p-0 flex-1 overflow-y-auto">
      <div class="divide-y divide-border">
        <RouterLink
          v-for="order in displayedOrders"
          :key="order.id"
          :to="{ name: 'maintenance-detail', params: { id: order.id } }"
          class="flex items-center gap-4 px-6 py-3 hover:bg-accent/50 transition-colors"
        >
          <span
            class="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-md"
            :class="iconClass(order)"
          >
            <ClipboardList class="h-4 w-4" />
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="metric-value text-sm font-medium">{{ order.id }}</span>
              <Badge variant="outline" class="text-xs">{{ order.type }}</Badge>
              <Badge :class="statusBadgeClass(order)" class="text-xs">
                {{ ORDER_STATUS_LABELS[order.status] }}
              </Badge>
            </div>
            <div class="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span class="metric-value">{{ order.equipmentId }}</span>
              <span v-if="order.scheduledDate">· {{ formatDate(order.scheduledDate) }}</span>
              <span v-if="order.assignedTo?.name" class="truncate">
                · {{ order.assignedTo.name }}
              </span>
            </div>
          </div>
        </RouterLink>

        <div v-if="displayedOrders.length === 0" class="px-6 py-10 text-center">
          <ClipboardList class="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
          <div class="text-sm text-muted-foreground">{{ emptyText }}</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ClipboardList } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useAuthStore } from '@/stores/auth'
import { ORDER_STATUS_LABELS } from '@/utils/constants'

const props = defineProps({
  mode: { type: String, default: 'assigned' },
  title: { type: String, default: 'Мои наряды' },
  subtitle: { type: String, default: '' },
  emptyText: { type: String, default: 'Нет активных нарядов' },
  limit: { type: Number, default: 8 },
})

const maintenanceStore = useMaintenanceStore()
const authStore = useAuthStore()

onMounted(() => {
  if (!maintenanceStore.orders.length) maintenanceStore.loadOrders().catch(() => {})
})

const displayedOrders = computed(() => {
  const list = maintenanceStore.orders || []
  let filtered = list
  if (props.mode === 'assigned') {
    filtered = list.filter(
      (o) =>
        o.assignedTo?.id === authStore.userId && !['completed', 'cancelled'].includes(o.status),
    )
  } else if (props.mode === 'review') {
    filtered = list.filter((o) => o.status === 'review')
  }
  return [...filtered]
    .sort((a, b) => {
      const da = a.scheduledDate || a.createdAt || ''
      const db = b.scheduledDate || b.createdAt || ''
      return da.localeCompare(db)
    })
    .slice(0, props.limit)
})

function iconClass(order) {
  const map = {
    planned: 'bg-status-info-bg text-status-info',
    in_progress: 'bg-status-warning-bg text-status-warning',
    review: 'bg-status-maintenance-bg text-status-maintenance',
    completed: 'bg-status-success-bg text-status-success',
    cancelled: 'bg-muted text-muted-foreground',
  }
  return map[order.status] || 'bg-muted text-muted-foreground'
}

function statusBadgeClass(order) {
  const map = {
    planned: 'bg-status-info-bg text-status-info border-status-info/30',
    in_progress: 'bg-status-warning-bg text-status-warning border-status-warning/30',
    review: 'bg-status-maintenance-bg text-status-maintenance border-status-maintenance/30',
    completed: 'bg-status-success-bg text-status-success border-status-success/30',
    cancelled: 'bg-muted text-muted-foreground',
  }
  return map[order.status] || 'bg-muted text-muted-foreground'
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>
