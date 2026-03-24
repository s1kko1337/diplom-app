<template>
  <Card class="w-full">
    <CardContent class="p-6 space-y-4">
      <!-- Step number and description -->
      <div>
        <p class="text-xs text-muted-foreground mb-1">Шаг {{ stepNumber }}</p>
        <h3 class="text-lg font-semibold">{{ step.description }}</h3>
        <StepTimer
          v-if="step.startedAt || step.status === 'in_progress'"
          :started-at="step.startedAt"
          :completed-at="step.completedAt"
          :active="step.status === 'in_progress'"
          class="mt-1"
        />
      </div>

      <!-- Requirement -->
      <div v-if="step.requirement" class="space-y-1">
        <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Требования</p>
        <p class="text-sm">{{ step.requirement }}</p>
      </div>

      <!-- Tools -->
      <div v-if="step.tools" class="space-y-1">
        <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Инструменты</p>
        <p class="text-sm">{{ step.tools }}</p>
      </div>

      <!-- Readonly mode -->
      <template v-if="readonly">
        <div v-if="step.status && step.status !== 'pending'" class="space-y-2">
          <Badge :class="stepStatusBadgeClass(step.status)">
            {{ STEP_STATUS_LABELS[step.status] }}
          </Badge>
          <p v-if="step.comment" class="text-sm text-muted-foreground">{{ step.comment }}</p>
          <p v-if="step.completedAt" class="text-xs text-muted-foreground">
            {{ formatDate(step.completedAt) }}
          </p>
        </div>
        <div v-else>
          <Badge variant="secondary">{{ STEP_STATUS_LABELS['pending'] }}</Badge>
        </div>
      </template>

      <!-- Editable mode -->
      <template v-else>
        <!-- Current status badge if already resolved -->
        <div v-if="step.status && step.status !== 'pending'">
          <Badge :class="stepStatusBadgeClass(step.status)">
            {{ STEP_STATUS_LABELS[step.status] }}
          </Badge>
        </div>

        <!-- Comment textarea -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium">
            Комментарий
            <span v-if="wantsToFail" class="text-muted-foreground font-normal ml-1"
              >(обязательно)</span
            >
          </label>
          <Textarea v-model="comment" placeholder="Введите комментарий..." class="min-h-[80px]" />
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap gap-2">
          <Button
            class="bg-green-600 hover:bg-green-700 text-white"
            @click="handleComplete('passed')"
          >
            Выполнено
          </Button>
          <Button
            variant="destructive"
            :disabled="!comment.trim()"
            @click="handleComplete('failed')"
          >
            Не выполнено
          </Button>
          <Button variant="outline" @click="handleComplete('skipped')"> Пропущено </Button>
        </div>
      </template>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { STEP_STATUS_LABELS } from '@/utils/constants'
import StepTimer from './StepTimer.vue'

defineProps({
  step: {
    type: Object,
    required: true,
  },
  stepNumber: {
    type: Number,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['complete'])

const comment = ref('')
const wantsToFail = ref(false)

function handleComplete(status) {
  wantsToFail.value = status === 'failed'
  emit('complete', { status, comment: comment.value })
}

function stepStatusBadgeClass(status) {
  if (status === 'passed')
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  if (status === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  if (status === 'skipped') return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  if (status === 'in_progress')
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  return ''
}

function formatDate(value) {
  if (!value) return ''
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
