<template>
  <div class="bg-surface-1 border-2 border-border p-4">
    <div class="flex items-center justify-between mb-3">
      <label class="text-xs">{{ label }}</label>
      <div class="metric-value text-sm">{{ value }} {{ unit }}</div>
    </div>

    <div class="relative h-2 bg-surface-2 border border-border">
      <div
        class="absolute top-0 left-0 h-full transition-all duration-150"
        :class="barClass"
        :style="{ width: Math.min(percentage, 100) + '%' }"
      />
    </div>

    <div class="mt-2 text-xs opacity-50 metric-value">
      {{ percentage.toFixed(1) }}% / MAX {{ max }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  max: { type: Number, required: true },
  unit: { type: String, default: '%' },
  status: { type: String, default: 'normal' },
})

const percentage = computed(() => (props.value / props.max) * 100)

const barClass = computed(() => {
  const map = {
    normal: 'bg-primary',
    warning: 'bg-primary opacity-80',
    critical: 'bg-status-critical-bg',
  }
  return map[props.status] || map.normal
})
</script>

<style scoped></style>
