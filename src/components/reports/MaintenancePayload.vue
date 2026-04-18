<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
      <div>
        <div class="text-xs text-muted-foreground">Тип ТО</div>
        <div class="metric-value mt-1">{{ payload.checklistType || '—' }}</div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Прогресс</div>
        <div class="metric-value mt-1">
          {{ payload.stepsCompleted ?? 0 }} / {{ payload.stepsTotal ?? 0 }}
          <span v-if="progressPercent !== null" class="text-xs text-muted-foreground">
            ({{ progressPercent }}%)
          </span>
        </div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Длительность</div>
        <div class="metric-value mt-1">{{ payload.duration || '—' }}</div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Исполнителей</div>
        <div class="metric-value mt-1">{{ executors.length }}</div>
      </div>
    </div>

    <div v-if="executors.length">
      <div class="text-xs uppercase text-muted-foreground mb-2">Исполнители</div>
      <ul class="space-y-1 text-sm">
        <li v-for="(ex, i) in executors" :key="ex.id || i">
          {{ ex.name || ex.id }}
        </li>
      </ul>
    </div>

    <div v-if="materials.length">
      <div class="text-xs uppercase text-muted-foreground mb-2">Использованные материалы</div>
      <div class="overflow-hidden rounded-md border border-border">
        <table class="w-full text-sm">
          <thead class="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th class="text-left px-3 py-2">Название</th>
              <th class="text-right px-3 py-2">Кол-во</th>
              <th class="text-left px-3 py-2 w-20">Ед.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in materials" :key="i" class="border-t border-border">
              <td class="px-3 py-2">{{ m.name }}</td>
              <td class="px-3 py-2 text-right metric-value">{{ m.qty }}</td>
              <td class="px-3 py-2">{{ m.unit }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="payload.notes">
      <div class="text-xs uppercase text-muted-foreground mb-2">Заметки</div>
      <p class="text-sm whitespace-pre-line">{{ payload.notes }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  payload: { type: Object, required: true },
})

const executors = computed(() => props.payload.executors || [])
const materials = computed(() => props.payload.materials || [])

const progressPercent = computed(() => {
  const total = props.payload.stepsTotal
  const done = props.payload.stepsCompleted
  if (!total || total <= 0) return null
  return Math.round((done / total) * 100)
})
</script>
