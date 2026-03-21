<template>
  <div class="space-y-4">
    <!-- Back link -->
    <RouterLink
      to="/maintenance"
      class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
    >
      ← Техобслуживание
    </RouterLink>

    <!-- Main row: ID, type, equipment -->
    <div class="flex flex-wrap items-center gap-3">
      <h2 class="text-2xl font-bold">{{ order.id }}</h2>
      <Badge variant="secondary">{{ order.type }}</Badge>
      <span class="text-muted-foreground text-sm">{{ order.equipmentId }}</span>

      <!-- Status badge with colored dot -->
      <span class="inline-flex items-center gap-1.5 text-sm">
        <span class="w-2.5 h-2.5 rounded-full" :class="ORDER_STATUS_COLORS[order.status]" />
        <span>{{ ORDER_STATUS_LABELS[order.status] }}</span>
      </span>
    </div>

    <!-- People section -->
    <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
      <span
        >Создал: <span class="text-foreground">{{ order.createdBy?.name || '—' }}</span></span
      >
      <span
        >Исполнитель: <span class="text-foreground">{{ order.assignedTo?.name || '—' }}</span></span
      >
      <span v-if="order.reviewedBy">
        Проверил: <span class="text-foreground">{{ order.reviewedBy.name }}</span>
      </span>
    </div>

    <!-- Dates section -->
    <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
      <span
        >Создан: <span class="text-foreground">{{ formatDate(order.createdAt) }}</span></span
      >
      <span v-if="order.startedAt">
        Начат: <span class="text-foreground">{{ formatDate(order.startedAt) }}</span>
      </span>
      <span v-if="order.completedAt">
        Завершён: <span class="text-foreground">{{ formatDate(order.completedAt) }}</span>
      </span>
    </div>

    <!-- Operating hours -->
    <div v-if="order.operatingHoursAtStart != null" class="text-sm text-muted-foreground">
      Наработка при начале:
      <span class="text-foreground">{{ order.operatingHoursAtStart }} ч</span>
    </div>

    <!-- Return reason alert -->
    <Card v-if="order.returnReason" class="border-amber-400 bg-amber-50 dark:bg-amber-950/30">
      <CardContent class="p-4 text-sm text-amber-800 dark:text-amber-200">
        <span class="font-medium">Причина возврата:</span> {{ order.returnReason }}
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants'

defineProps({
  order: {
    type: Object,
    required: true,
  },
})

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}
</script>

<style scoped></style>
