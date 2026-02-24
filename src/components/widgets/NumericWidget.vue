<template>
  <div class="h-full flex flex-col justify-center p-4">
    <div class="text-xs opacity-50 mb-1 truncate">{{ title }}</div>
    <div class="flex items-baseline gap-2">
      <span class="metric-value text-3xl">{{ displayValue }}</span>
      <span class="text-sm opacity-50">{{ sensor?.unit }}</span>
    </div>
    <div v-if="sensor" class="mt-2 flex items-center gap-2">
      <div
        class="w-2 h-2"
        :class="{
          'bg-primary': statusLevel === 'normal',
          'bg-yellow-500': statusLevel === 'warning',
          'bg-red-500 animate-pulse': statusLevel === 'critical',
        }"
      />
      <span class="text-xs opacity-40">{{ statusLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: Number, default: null },
  sensor: { type: Object, default: null },
})

const displayValue = computed(() => {
  if (props.value === null) return '—'
  return props.value >= 1000 ? props.value.toLocaleString('ru-RU') : String(props.value)
})

const statusLevel = computed(() => {
  if (!props.sensor || props.value === null) return 'normal'
  const { thresholds } = props.sensor
  if (!thresholds) return 'normal'
  if (props.value >= thresholds.critical) return 'critical'
  if (props.value >= thresholds.warning) return 'warning'
  return 'normal'
})

const statusLabel = computed(() => {
  if (statusLevel.value === 'critical') return 'КРИТИЧЕСКОЕ'
  if (statusLevel.value === 'warning') return 'ВНИМАНИЕ'
  return 'НОРМА'
})
</script>
