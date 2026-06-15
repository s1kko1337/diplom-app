<template>
  <div class="bg-surface-1 border border-border rounded-md p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2 min-w-0">
        <span class="inline-block h-2 w-2 rounded-full shrink-0" :class="dotClass" />
        <label class="text-xs truncate">{{ label }}</label>
      </div>
      <div class="metric-value text-sm shrink-0">{{ value }} {{ unit }}</div>
    </div>

    <div class="relative h-2 bg-surface-2 border border-border rounded-full">
      <div
        class="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
        :class="barClass"
        :style="{ width: Math.min(percentage, 100) + '%' }"
      />
    </div>

    <div class="mt-2 flex items-center justify-between text-xs">
      <span class="font-medium" :class="textClass">{{ statusLabel }}</span>
      <span class="opacity-50 metric-value">{{ percentage.toFixed(1) }}% / MAX {{ max }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  INDICATOR_STATUS_LABELS,
  INDICATOR_STATUS_COLORS,
  INDICATOR_STATUS_DOT_COLORS,
  INDICATOR_STATUS_BAR_COLORS,
} from '@/utils/constants'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  max: { type: Number, required: true },
  unit: { type: String, default: '%' },
  status: { type: String, default: 'normal' },
})

const percentage = computed(() => (props.value / props.max) * 100)

const statusLabel = computed(
  () => INDICATOR_STATUS_LABELS[props.status] || INDICATOR_STATUS_LABELS.normal,
)
const dotClass = computed(
  () => INDICATOR_STATUS_DOT_COLORS[props.status] || INDICATOR_STATUS_DOT_COLORS.normal,
)
const textClass = computed(
  () => INDICATOR_STATUS_COLORS[props.status] || INDICATOR_STATUS_COLORS.normal,
)
const barClass = computed(
  () => INDICATOR_STATUS_BAR_COLORS[props.status] || INDICATOR_STATUS_BAR_COLORS.normal,
)
</script>
