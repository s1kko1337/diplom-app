<template>
  <div class="space-y-6">
    <!-- Steps table (read-only) -->
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
    </div>

    <!-- Action buttons -->
    <div class="space-y-4">
      <div class="flex flex-wrap gap-3">
        <Button class="bg-green-600 hover:bg-green-700 text-white" @click="emit('approve')">
          Утвердить
        </Button>
        <Button
          variant="outline"
          class="border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
          @click="toggleReturnForm"
        >
          Вернуть на доработку
        </Button>
      </div>

      <!-- Return reason form -->
      <div
        v-if="showReturnForm"
        class="space-y-3 p-4 border border-amber-300 rounded-lg bg-amber-50 dark:bg-amber-950/20"
      >
        <label class="text-sm font-medium">Причина возврата</label>
        <Textarea
          v-model="returnReason"
          placeholder="Укажите причину возврата наряда..."
          class="min-h-[80px]"
        />
        <div class="flex gap-2">
          <Button
            class="bg-amber-600 hover:bg-amber-700 text-white"
            :disabled="!returnReason.trim()"
            @click="handleReturn"
          >
            Подтвердить возврат
          </Button>
          <Button variant="outline" @click="toggleReturnForm"> Отмена </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['approve', 'return'])

const maintenanceStore = useMaintenanceStore()

const showReturnForm = ref(false)
const returnReason = ref('')

const progress = computed(() => maintenanceStore.getProgress(props.order))

function toggleReturnForm() {
  showReturnForm.value = !showReturnForm.value
  if (!showReturnForm.value) {
    returnReason.value = ''
  }
}

function handleReturn() {
  emit('return', returnReason.value)
}

function stepStatusBadgeClass(status) {
  if (status === 'passed')
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  if (status === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  if (status === 'skipped') return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  return 'bg-muted text-muted-foreground'
}
</script>

<style scoped></style>
