<template>
  <div class="h-full flex flex-col p-4 overflow-y-auto">
    <div class="text-xs opacity-50 mb-3">ИСТОРИЯ ОБСЛУЖИВАНИЯ</div>
    <div v-if="equipment?.serviceHistory?.length" class="space-y-3 flex-1">
      <div
        v-for="item in equipment.serviceHistory"
        :key="item.date"
        class="pb-2 border-b border-border last:border-0"
      >
        <div class="flex justify-between items-start">
          <div class="min-w-0 flex-1">
            <div class="text-sm truncate">{{ item.type }}</div>
            <div class="metric-value text-xs opacity-50 mt-0.5">{{ item.date }}</div>
          </div>
          <div class="text-xs px-2 py-0.5 border border-border shrink-0 ml-2">
            {{ item.status }}
          </div>
        </div>
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
