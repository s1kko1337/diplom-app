<template>
  <div
    class="bg-surface-1 border-2 transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[-2px]"
    :class="isActive ? 'border-primary' : 'border-border'"
  >
    <div class="p-4 border-b-2 border-border">
      <div class="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2 L14 6 L12 6 L12 18 L8 18 L8 6 L6 6 Z" fill="currentColor" />
          <rect x="5" y="18" width="10" height="1" fill="currentColor" />
        </svg>
        <h3 class="text-sm">{{ name }}</h3>
      </div>
      <div class="metric-value text-xs opacity-50 mt-1">{{ equipmentId }}</div>
    </div>

    <div class="p-4 space-y-2">
      <div
        v-for="(item, index) in status"
        :key="index"
        class="flex items-center justify-between text-sm"
      >
        <div class="flex items-center gap-2">
          <span class="opacity-40">├─</span>
          <span class="text-xs opacity-70">{{ item.label }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="metric-value text-xs">{{ item.value }}</span>
          <Circle
            class="w-3 h-3"
            :class="{
              'fill-current': item.status === 'active',
              'fill-current opacity-60': item.status === 'warning',
              '': item.status === 'error',
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Circle } from 'lucide-vue-next'

defineProps({
  name: { type: String, required: true },
  equipmentId: { type: String, required: true },
  status: { type: Array, required: true },
  isActive: { type: Boolean, default: false },
})
</script>

<style scoped></style>
