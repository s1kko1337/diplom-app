<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card v-for="metric in metrics" :key="metric.label">
      <CardHeader class="pb-2">
        <CardDescription>{{ metric.label }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center gap-2">
          <span class="inline-block h-2.5 w-2.5 shrink-0 rounded-full" :class="metric.dotColor" />
          <span class="text-2xl font-semibold metric-value">{{ metric.count }}</span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { STATUS_DOT_COLORS } from '@/utils/constants'

const props = defineProps({
  equipment: { type: Array, default: () => [] },
})

const metrics = computed(() => {
  const list = props.equipment
  return [
    {
      label: 'Всего станков',
      count: list.length,
      dotColor: 'bg-primary',
    },
    {
      label: 'В работе',
      count: list.filter((e) => e.status === 'working').length,
      dotColor: STATUS_DOT_COLORS.working,
    },
    {
      label: 'Неисправность',
      count: list.filter((e) => e.status === 'malfunction').length,
      dotColor: STATUS_DOT_COLORS.malfunction,
    },
    {
      label: 'Простой / Отключён',
      count:
        list.filter((e) => e.status === 'idle').length +
        list.filter((e) => e.status === 'offline').length,
      dotColor: STATUS_DOT_COLORS.idle,
    },
  ]
})
</script>
