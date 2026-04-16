<template>
  <Card class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateToDetail">
    <CardContent class="p-4 space-y-2">
      <!-- Top row: type badge + order id -->
      <div class="flex items-center justify-between">
        <Badge variant="secondary">{{ order.type }}</Badge>
        <span class="text-xs text-muted-foreground">{{ order.id }}</span>
      </div>

      <!-- Equipment -->
      <div class="text-sm font-medium">
        <span v-if="equipment">{{ equipment.id }} — {{ equipment.model }}</span>
        <span v-else class="text-muted-foreground">{{ order.equipmentId }}</span>
      </div>

      <!-- Assignee -->
      <div class="text-sm text-muted-foreground">
        Исполнитель: {{ order.assignedTo?.name || '—' }}
      </div>

      <!-- Date -->
      <div class="text-xs text-muted-foreground">{{ formattedDate }}</div>

      <!-- Progress bar -->
      <div v-if="progress.total > 0" class="space-y-1">
        <div class="flex justify-between text-xs text-muted-foreground">
          <span>Прогресс</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <div class="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            class="h-full bg-primary rounded-full transition-all"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
      </div>

      <!-- Cancelled badge + restore -->
      <div v-if="order.status === 'cancelled'" class="flex items-center justify-between gap-2">
        <Badge
          variant="secondary"
          class="bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
        >
          Отменено
        </Badge>
        <Button
          v-if="canRestore"
          variant="outline"
          size="sm"
          :disabled="restoring"
          @click.stop="handleRestore"
        >
          <RotateCcw class="w-3.5 h-3.5 mr-1" />
          {{ restoring ? '...' : 'Восстановить' }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RotateCcw } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEquipmentStore } from '@/stores/equipment'
import { useMaintenanceStore } from '@/stores/maintenance'
import { usePermissions } from '@/composables/usePermissions'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const equipmentStore = useEquipmentStore()
const maintenanceStore = useMaintenanceStore()
const { canCreate } = usePermissions()

const restoring = ref(false)
const canRestore = computed(() => canCreate.value)

const equipment = computed(() => equipmentStore.list.find((e) => e.id === props.order.equipmentId))

const progress = computed(() => maintenanceStore.getProgress(props.order))

const progressPercent = computed(() => {
  const { total, passed, failed, skipped } = progress.value
  if (total === 0) return 0
  return Math.round(((passed + failed + skipped) / total) * 100)
})

const formattedDate = computed(() => {
  if (!props.order.createdAt) return ''
  const date = new Date(props.order.createdAt)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
})

function navigateToDetail() {
  router.push({ name: 'maintenance-detail', params: { id: props.order.id } })
}

async function handleRestore() {
  if (restoring.value) return
  restoring.value = true
  try {
    await maintenanceStore.restoreOrder(props.order.id)
  } catch (e) {
    console.error(e)
  } finally {
    restoring.value = false
  }
}
</script>

<style scoped></style>
