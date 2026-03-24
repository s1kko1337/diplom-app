<template>
  <div class="space-y-6">
    <!-- Steps table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">N</TableHead>
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
      <span v-if="progress.in_progress > 0">
        Выполняется:
        <span class="font-semibold text-yellow-600">{{ progress.in_progress }}</span>
      </span>
      <span v-if="progress.pending > 0">
        Ожидает:
        <span class="font-semibold text-muted-foreground">{{ progress.pending }}</span>
      </span>
    </div>

    <!-- Time statistics -->
    <div v-if="timeStats" class="rounded-lg border p-4 space-y-2 text-sm">
      <h4 class="font-semibold text-foreground">Статистика выполнения:</h4>
      <div class="space-y-1 text-muted-foreground">
        <p>
          Общее время:
          <span class="font-medium text-foreground">{{ timeStats.totalFormatted }}</span>
        </p>
        <p>
          Среднее время на шаг:
          <span class="font-medium text-foreground">{{ timeStats.avgFormatted }}</span>
        </p>
        <p v-if="timeStats.longest">
          Самый долгий шаг:
          <span class="font-medium text-foreground">
            {{ timeStats.longest.description }} — {{ timeStats.longest.durationFormatted }}
          </span>
        </p>
      </div>
    </div>

    <!-- Remarks textarea (only in non-readonly mode) -->
    <div v-if="!readonly" class="space-y-2">
      <label class="text-sm font-medium">Замечания</label>
      <Textarea
        :model-value="order.remarks || ''"
        placeholder="Общие замечания по результатам обслуживания..."
        class="min-h-[80px]"
        @update:model-value="handleRemarksUpdate"
      />
    </div>

    <!-- Submit button (only in non-readonly mode) -->
    <Button
      v-if="!readonly"
      :disabled="progress.pending > 0 || progress.in_progress > 0"
      @click="emit('submit')"
    >
      Отправить на приёмку
    </Button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { durationBetween, formatDurationHuman } from '@/utils/formatDuration'

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

const timeStats = computed(() => {
  const steps = props.order.steps || []
  const completedSteps = steps.filter((s) => s.startedAt && s.completedAt)
  if (completedSteps.length === 0) return null

  const durations = completedSteps.map((s) => ({
    description: s.description,
    duration: durationBetween(s.startedAt, s.completedAt),
  }))

  const totalMs = durations.reduce((sum, d) => sum + d.duration, 0)
  const avgMs = Math.round(totalMs / durations.length)
  const longest = durations.reduce((max, d) => (d.duration > max.duration ? d : max), durations[0])

  return {
    totalFormatted: formatDurationHuman(totalMs),
    avgFormatted: formatDurationHuman(avgMs),
    longest: {
      description: longest.description,
      durationFormatted: formatDurationHuman(longest.duration),
    },
  }
})

function handleRemarksUpdate(value) {
  if (maintenanceStore.currentOrder) {
    maintenanceStore.currentOrder.remarks = value
  }
}

function stepStatusBadgeClass(status) {
  if (status === 'passed')
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  if (status === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  if (status === 'skipped') return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  if (status === 'in_progress')
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  return 'bg-muted text-muted-foreground'
}
</script>

<style scoped></style>
