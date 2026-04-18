<template>
  <div class="space-y-6">
    <div>
      <div class="text-xs text-muted-foreground">Период</div>
      <div class="metric-value mt-1">
        {{ formatDate(payload.periodFrom) }} — {{ formatDate(payload.periodTo) }}
      </div>
    </div>

    <div v-if="hasMetrics">
      <div class="text-xs uppercase text-muted-foreground mb-2">Метрики</div>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div
          v-for="m in metricRows"
          :key="m.key"
          class="rounded-md border border-border bg-card p-3"
        >
          <div class="text-xs text-muted-foreground">{{ m.label }}</div>
          <div class="metric-value mt-1 text-lg">{{ m.value }}</div>
        </div>
      </div>
    </div>

    <div v-if="trends.length">
      <div class="text-xs uppercase text-muted-foreground mb-2">Тренды</div>
      <div class="overflow-hidden rounded-md border border-border">
        <table class="w-full text-sm">
          <thead class="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th class="text-left px-3 py-2">Метрика</th>
              <th class="text-right px-3 py-2">Изменение</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(t, i) in trends" :key="i" class="border-t border-border">
              <td class="px-3 py-2">{{ metricLabel(t.metric) }}</td>
              <td class="px-3 py-2 text-right metric-value">{{ t.change }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="payload.conclusions">
      <div class="text-xs uppercase text-muted-foreground mb-2">Выводы</div>
      <p class="text-sm whitespace-pre-line">{{ payload.conclusions }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  payload: { type: Object, required: true },
})

const METRIC_LABELS = {
  avgLoad: 'Средняя загрузка, %',
  incidents: 'Инциденты',
  maintenances: 'ТО выполнено',
  downtime: 'Простой',
}

const trends = computed(() => props.payload.trends || [])

const metricRows = computed(() => {
  const m = props.payload.metrics || {}
  return Object.keys(METRIC_LABELS)
    .filter((k) => m[k] !== undefined && m[k] !== null && m[k] !== '')
    .map((k) => ({ key: k, label: METRIC_LABELS[k], value: m[k] }))
})

const hasMetrics = computed(() => metricRows.value.length > 0)

function metricLabel(key) {
  return METRIC_LABELS[key] || key
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
