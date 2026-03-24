<template>
  <div class="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
    <p class="text-sm font-medium">{{ measurement.description }}</p>
    <p class="text-xs text-muted-foreground">
      Норма: {{ measurement.norm }} {{ measurement.unit }}
    </p>

    <!-- Readonly mode -->
    <div v-if="readonly" class="flex items-center gap-2">
      <span class="text-sm">
        Факт:
        {{ measurement.fact !== null ? `${measurement.fact} ${measurement.unit}` : 'не заполнено' }}
      </span>
      <Badge v-if="measurement.passed !== null" :class="passedBadgeClass">
        {{ measurement.passed ? 'Соответствует' : 'Не соответствует' }}
      </Badge>
    </div>

    <!-- Editable mode -->
    <div v-else class="flex items-center gap-3">
      <label class="text-sm text-muted-foreground shrink-0">Факт:</label>
      <Input
        type="number"
        step="any"
        :model-value="measurement.fact"
        class="w-32"
        placeholder="—"
        @input="handleFactInput"
      />
      <span class="text-xs text-muted-foreground shrink-0">{{ measurement.unit }}</span>
      <Badge v-if="measurement.passed !== null" :class="passedBadgeClass">
        {{ measurement.passed ? 'Соответствует' : 'Не соответствует' }}
      </Badge>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const props = defineProps({
  measurement: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:measurement'])

const passedBadgeClass = computed(() => {
  if (props.measurement.passed === null) return ''
  return props.measurement.passed
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
})

function parseNorm(norm) {
  if (!norm) return null
  const numberMatch = norm.match(/([\d.]+)/)
  if (!numberMatch) return null
  const value = parseFloat(numberMatch[1])
  if (norm.includes('не более')) {
    return { value, direction: 'max' }
  }
  if (norm.includes('не менее')) {
    return { value, direction: 'min' }
  }
  return { value, direction: 'exact' }
}

function checkPassed(fact, norm) {
  if (fact === null || fact === '' || isNaN(fact)) return null
  const parsed = parseNorm(norm)
  if (!parsed) return null
  const factNum = parseFloat(fact)
  if (parsed.direction === 'max') return factNum <= parsed.value
  if (parsed.direction === 'min') return factNum >= parsed.value
  return factNum === parsed.value
}

function handleFactInput(event) {
  const raw = event.target.value
  const fact = raw === '' ? null : parseFloat(raw)
  const passed = checkPassed(fact, props.measurement.norm)
  emit('update:measurement', { ...props.measurement, fact, passed })
}
</script>

<style scoped></style>
