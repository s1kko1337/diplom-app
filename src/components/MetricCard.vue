<template>
  <div
    class="relative p-6 border-2 transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[-2px]"
    :class="statusClasses"
    :style="{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }"
  >
    <div
      class="absolute top-0 right-0 w-[20px] h-[20px] bg-primary opacity-10"
      :style="{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }"
    />

    <div class="flex items-start justify-between mb-4">
      <label class="text-xs opacity-70">{{ title }}</label>
      <div class="opacity-60">
        <TrendingUp v-if="trend === 'up'" class="w-5 h-5" />
        <TrendingDown v-else-if="trend === 'down'" class="w-5 h-5" />
        <Activity v-else class="w-5 h-5" />
      </div>
    </div>

    <div class="flex items-baseline gap-2">
      <div class="metric-value text-4xl font-bold tracking-tight">{{ value }}</div>
      <div v-if="unit" class="text-lg opacity-60 metric-value">{{ unit }}</div>
    </div>

    <div v-if="subtitle" class="mt-2 text-sm opacity-50">{{ subtitle }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Activity } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  trend: { type: String, default: 'neutral' },
  status: { type: String, default: 'normal' },
  subtitle: { type: String, default: '' },
})

const statusClasses = computed(() => {
  const map = {
    normal: 'bg-surface-1 border-border',
    warning: 'bg-surface-2 border-border',
    critical: 'bg-status-critical-bg text-status-critical-text border-primary animate-pulse',
  }
  return map[props.status] || map.normal
})
</script>

<style scoped></style>
