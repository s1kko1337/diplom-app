<template>
  <div class="h-full flex flex-col items-center justify-center p-4">
    <div class="text-xs opacity-50 mb-3">СТАТУС ОБОРУДОВАНИЯ</div>
    <div v-if="equipment">
      <div
        class="w-16 h-16 mx-auto flex items-center justify-center border-4 mb-3"
        :class="borderColor"
      >
        <div class="w-6 h-6 rounded-full" :class="dotColor" />
      </div>
      <div class="text-center text-sm">{{ equipment.statusLabel }}</div>
      <div class="text-center text-xs opacity-50 mt-1 metric-value">{{ equipment.id }}</div>
    </div>
    <div v-else class="text-sm opacity-30">НЕТ ДАННЫХ</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  equipment: { type: Object, default: null },
})

const borderColor = computed(() => {
  const map = {
    working: 'border-primary',
    idle: 'border-yellow-500',
    malfunction: 'border-red-500',
    offline: 'border-border',
  }
  return map[props.equipment?.status] || 'border-border'
})

const dotColor = computed(() => {
  const map = {
    working: 'bg-primary animate-pulse',
    idle: 'bg-yellow-500',
    malfunction: 'bg-red-500 animate-pulse',
    offline: 'bg-border',
  }
  return map[props.equipment?.status] || 'bg-border'
})
</script>
