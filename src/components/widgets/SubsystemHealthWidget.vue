<template>
  <div class="h-full flex flex-col p-4 overflow-hidden">
    <div class="text-xs opacity-50 mb-3">{{ title || 'ЗДОРОВЬЕ ПОДСИСТЕМ' }}</div>

    <div
      v-if="equipment && equipment.subsystemHealth"
      class="flex-1 flex flex-col justify-center gap-3"
    >
      <div v-for="sub in subsystems" :key="sub.id" class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-xs">{{ sub.label }}</span>
          <span class="text-xs metric-value" :class="valueColor(sub.value)">
            {{ sub.value }}%
          </span>
        </div>
        <div class="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="barColor(sub.value)"
            :style="{ width: sub.value + '%' }"
          />
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-sm opacity-30">НЕТ ДАННЫХ</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SUBSYSTEMS } from '@/utils/constants'

const props = defineProps({
  title: { type: String, default: '' },
  equipment: { type: Object, default: null },
  equipmentId: { type: String, default: '' },
})

const subsystems = computed(() => {
  if (!props.equipment?.subsystemHealth) return []
  return SUBSYSTEMS.map((sub) => ({
    id: sub.id,
    label: sub.label,
    value: props.equipment.subsystemHealth[sub.id] ?? 0,
  }))
})

function barColor(value) {
  if (value > 80) return 'bg-green-500'
  if (value >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function valueColor(value) {
  if (value > 80) return 'text-green-500'
  if (value >= 50) return 'text-yellow-500'
  return 'text-red-500'
}
</script>
