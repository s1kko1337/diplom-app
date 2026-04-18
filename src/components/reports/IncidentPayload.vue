<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
      <div>
        <div class="text-xs text-muted-foreground">Серьёзность</div>
        <div class="mt-1">
          <Badge :variant="severityVariant">{{ severityLabel }}</Badge>
        </div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Простой</div>
        <div class="metric-value mt-1">{{ payload.downtime || '—' }}</div>
      </div>
    </div>

    <div v-if="payload.rootCause">
      <div class="text-xs uppercase text-muted-foreground mb-2">Причина</div>
      <p class="text-sm whitespace-pre-line">{{ payload.rootCause }}</p>
    </div>

    <div v-if="actions.length">
      <div class="text-xs uppercase text-muted-foreground mb-2">Выполненные действия</div>
      <ul class="space-y-1 text-sm list-disc pl-5">
        <li v-for="(a, i) in actions" :key="i">{{ a }}</li>
      </ul>
    </div>

    <div v-if="payload.recommendations">
      <div class="text-xs uppercase text-muted-foreground mb-2">Рекомендации</div>
      <p class="text-sm whitespace-pre-line">{{ payload.recommendations }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  payload: { type: Object, required: true },
})

const actions = computed(() => props.payload.actions || [])

const severityLabel = computed(
  () =>
    ({
      critical: 'Критический',
      warning: 'Предупреждение',
      info: 'Информация',
    })[props.payload.severity] ||
    props.payload.severity ||
    '—',
)

const severityVariant = computed(() => {
  switch (props.payload.severity) {
    case 'critical':
      return 'destructive'
    case 'warning':
      return 'secondary'
    default:
      return 'outline'
  }
})
</script>
