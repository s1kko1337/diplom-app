<template>
  <div class="h-full flex flex-col p-4 overflow-y-auto">
    <div class="text-xs opacity-50 mb-3">ЗАМЕНЫ ДЕТАЛЕЙ</div>
    <div v-if="loading" class="flex-1 flex items-center justify-center text-sm opacity-30">
      ЗАГРУЗКА...
    </div>
    <div v-else-if="parts.length" class="space-y-2 flex-1">
      <div
        v-for="part in parts"
        :key="part.id"
        class="pb-2 border-b border-border last:border-0"
      >
        <div class="flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <div class="text-sm truncate">{{ part.partName }}</div>
            <div class="metric-value text-xs opacity-50 mt-0.5">
              {{ part.date }} &bull; {{ part.replacedBy }}
            </div>
          </div>
          <span
            class="text-xs px-1.5 py-0.5 border shrink-0 ml-2"
            :class="
              part.isOriginal
                ? 'border-primary text-primary'
                : 'border-status-critical-text text-status-critical-text'
            "
          >
            {{ part.isOriginal ? 'ОРГ' : 'АНЛ' }}
          </span>
        </div>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center text-sm opacity-30">
      НЕТ ЗАМЕН
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getReplacements } from '@/api/parts'

const props = defineProps({
  title: { type: String, default: '' },
  equipment: { type: Object, default: null },
  equipmentId: { type: String, default: '' },
})

const parts = ref([])
const loading = ref(false)

onMounted(async () => {
  if (!props.equipmentId) return
  loading.value = true
  try {
    parts.value = await getReplacements(props.equipmentId)
  } finally {
    loading.value = false
  }
})
</script>
