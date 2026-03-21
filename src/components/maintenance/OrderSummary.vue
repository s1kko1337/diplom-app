<template>
  <div class="space-y-6">
    <!-- Steps table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">№</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead class="w-36">Статус</TableHead>
              <TableHead>Комментарий</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(step, index) in order.steps" :key="step.id">
              <TableCell class="text-muted-foreground">{{ index + 1 }}</TableCell>
              <TableCell>{{ step.description }}</TableCell>
              <TableCell>
                <Badge :class="stepStatusBadgeClass(step.status)">
                  {{ STEP_STATUS_LABELS[step.status] }}
                </Badge>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ step.comment || '—' }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Statistics -->
    <div class="flex flex-wrap gap-4 text-sm">
      <span>
        Выполнено:
        <span class="font-semibold text-green-600">{{ progress.passed }}</span>
      </span>
      <span>
        Не выполнено:
        <span class="font-semibold text-red-600">{{ progress.failed }}</span>
      </span>
      <span>
        Пропущено:
        <span class="font-semibold text-zinc-500">{{ progress.skipped }}</span>
      </span>
      <span v-if="progress.pending > 0">
        Ожидает:
        <span class="font-semibold text-muted-foreground">{{ progress.pending }}</span>
      </span>
    </div>

    <!-- Submit button (only in non-readonly mode) -->
    <Button v-if="!readonly" :disabled="progress.pending > 0" @click="emit('submit')">
      Отправить на приёмку
    </Button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { STEP_STATUS_LABELS } from '@/utils/constants'
import { useMaintenanceStore } from '@/stores/maintenance'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const maintenanceStore = useMaintenanceStore()

const progress = computed(() => maintenanceStore.getProgress(props.order))

function stepStatusBadgeClass(status) {
  if (status === 'passed')
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  if (status === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  if (status === 'skipped') return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  return 'bg-muted text-muted-foreground'
}
</script>

<style scoped></style>
