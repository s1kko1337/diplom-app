<template>
  <div class="h-full flex flex-col p-4 overflow-hidden">
    <div class="text-xs opacity-50 mb-3">{{ title || 'ЦИКЛ ТО' }}</div>

    <div v-if="equipment" class="flex-1 flex flex-col justify-center min-h-0">
      <!-- Timeline bar -->
      <div class="relative mb-4">
        <div class="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary rounded-full transition-all duration-300"
            :style="{ width: progressPercent + '%' }"
          />
        </div>

        <!-- Current position marker -->
        <div
          class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border-2 border-surface-1 rounded-full shadow-md transition-all duration-300"
          :style="{ left: `calc(${progressPercent}% - 6px)` }"
        />
      </div>

      <!-- Milestones -->
      <div class="flex items-start justify-between gap-1 overflow-x-auto">
        <div
          v-for="item in milestones"
          :key="item.key"
          class="flex flex-col items-center flex-shrink-0 min-w-0"
          :class="item.isNext ? 'opacity-100' : 'opacity-60'"
        >
          <div class="w-2.5 h-2.5 rounded-full mb-1 flex-shrink-0" :class="milestoneColor(item)" />
          <span
            class="text-[10px] leading-tight text-center metric-value"
            :class="item.isNext ? 'text-primary font-semibold' : ''"
          >
            {{ item.key }}
          </span>
          <span v-if="item.hours" class="text-[9px] opacity-40 metric-value">
            {{ item.hours }}ч
          </span>
        </div>
      </div>

      <!-- Next maintenance info -->
      <div v-if="nextMaintenance" class="mt-3 text-xs text-center">
        <span class="opacity-50">Следующее:</span>
        <span class="text-primary font-medium ml-1">{{ nextMaintenance.type }}</span>
        <span class="opacity-40 ml-1"> через {{ nextMaintenance.hoursRemaining }} м/ч </span>
      </div>

      <!-- Current hours -->
      <div class="mt-1 text-center">
        <span class="text-[10px] opacity-40"> Наработка: {{ equipment.operatingHours }} м/ч </span>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-sm opacity-30">НЕТ ДАННЫХ</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MAINTENANCE_SCHEDULE } from '@/utils/constants'
import { useMaintenanceStore } from '@/stores/maintenance'

const props = defineProps({
  title: { type: String, default: '' },
  equipment: { type: Object, default: null },
  equipmentId: { type: String, default: '' },
})

const maintenanceStore = useMaintenanceStore()

const nextMaintenance = computed(() => {
  if (!props.equipmentId) return null
  return maintenanceStore.getNextMaintenance(props.equipmentId)
})

const cycleHours = computed(() => {
  if (!props.equipment) return 0
  return props.equipment.operatingHours % 20000
})

const progressPercent = computed(() => {
  return Math.min((cycleHours.value / 20000) * 100, 100)
})

const milestones = computed(() => {
  const nextType = nextMaintenance.value?.type
  return Object.entries(MAINTENANCE_SCHEDULE).map(([key, val]) => ({
    key,
    hours: val.hours,
    label: val.label,
    passed: val.hours !== null && cycleHours.value >= val.hours,
    isNext: key === nextType,
  }))
})

function milestoneColor(item) {
  if (item.isNext) return 'bg-primary'
  if (item.passed) return 'bg-primary/40'
  return 'bg-surface-2'
}
</script>
