<template>
  <div class="flex items-center gap-3 px-4 py-2 bg-surface-1 border border-border">
    <Activity class="w-4 h-4 animate-pulse" />
    <div>
      <div class="text-xs opacity-70">{{ label }}</div>
      <div class="metric-value text-xs">Обновлено {{ timeSinceUpdate }}с назад</div>
    </div>
  </div>
</template>

<script setup>
import { Activity } from 'lucide-vue-next'
import { useLiveData } from '@/composables/useLiveData'

const props = defineProps({
  label: { type: String, default: 'ДАННЫЕ' },
  updateInterval: { type: Number, default: 5000 },
})

const { timeSinceUpdate } = useLiveData(props.updateInterval)
</script>

<style scoped></style>
