<template>
  <div class="h-full flex flex-col justify-center p-4">
    <div class="text-xs opacity-50 mb-2">КРАТКАЯ ИНФОРМАЦИЯ</div>
    <div v-if="equipment">
      <div class="text-lg mb-1">{{ equipment.fullModel }}</div>
      <div class="metric-value text-sm opacity-60">ID: {{ equipment.serial }}</div>
      <div class="flex items-center gap-2 mt-3">
        <div
          class="w-2 h-2 rounded-full"
          :class="{
            'bg-primary animate-pulse': equipment.status === 'working',
            'bg-yellow-500': equipment.status === 'idle',
            'bg-red-500 animate-pulse': equipment.status === 'malfunction',
            'bg-border': equipment.status === 'offline',
          }"
        />
        <span class="text-xs">{{ equipment.statusLabel }}</span>
      </div>
      <div v-if="equipment.year" class="text-xs opacity-40 mt-2 metric-value">
        В эксплуатации с {{ equipment.year }} г.
      </div>
    </div>
    <div v-else class="text-sm opacity-30">НЕТ ДАННЫХ</div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  equipment: { type: Object, default: null },
})
</script>
