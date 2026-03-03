<template>
  <div class="h-full flex flex-col p-4 overflow-y-auto">
    <div class="text-xs opacity-50 mb-3">ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ</div>
    <div v-if="equipment?.specs?.length" class="space-y-2 flex-1">
      <div
        v-for="spec in equipment.specs"
        :key="spec.label"
        class="flex justify-between text-sm border-b border-border pb-1 last:border-0"
      >
        <span class="opacity-70 truncate mr-2">{{ spec.label }}</span>
        <span class="metric-value shrink-0">{{ spec.value }}</span>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center text-sm opacity-30">НЕТ ДАННЫХ</div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  equipment: { type: Object, default: null },
})
</script>
