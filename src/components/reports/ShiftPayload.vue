<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
      <div>
        <div class="text-xs text-muted-foreground">Смена</div>
        <div class="metric-value mt-1">{{ shiftLabel }}</div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Дата</div>
        <div class="metric-value mt-1">{{ formatDate(payload.date) }}</div>
      </div>
    </div>

    <div v-if="equipmentStatus.length">
      <div class="text-xs uppercase text-muted-foreground mb-2">Состояние оборудования</div>
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div
          v-for="(item, i) in equipmentStatus"
          :key="i"
          class="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
        >
          <span class="metric-value">{{ item.id }}</span>
          <Badge variant="outline">{{ statusLabel(item.status) }}</Badge>
        </div>
      </div>
    </div>

    <div v-if="worksCompleted.length">
      <div class="text-xs uppercase text-muted-foreground mb-2">Выполненные работы</div>
      <ul class="space-y-1 text-sm list-disc pl-5">
        <li v-for="(w, i) in worksCompleted" :key="i">{{ w }}</li>
      </ul>
    </div>

    <div v-if="payload.issues">
      <div class="text-xs uppercase text-muted-foreground mb-2">Замечания</div>
      <p class="text-sm whitespace-pre-line">{{ payload.issues }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/utils/constants'

const props = defineProps({
  payload: { type: Object, required: true },
})

const equipmentStatus = computed(() => props.payload.equipmentStatus || [])
const worksCompleted = computed(() => props.payload.worksCompleted || [])

const shiftLabel = computed(() => {
  return { day: 'Дневная', night: 'Ночная' }[props.payload.shift] || props.payload.shift || '—'
})

function statusLabel(s) {
  return STATUS_LABELS[s] || s || '—'
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ru-RU')
  } catch {
    return iso
  }
}
</script>
