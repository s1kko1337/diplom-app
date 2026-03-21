<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <MetricCard
      title="ВСЕГО ОБОРУДОВАНИЯ"
      :value="String(equipment.length)"
      unit="ШТ"
      trend="neutral"
      subtitle="Весь парк"
    />
    <MetricCard
      title="В РАБОТЕ"
      :value="String(workingCount)"
      unit="ШТ"
      trend="up"
      :subtitle="`${workingPercent}% парка`"
    />
    <MetricCard
      title="СРЕДНЯЯ ЭФФЕКТИВНОСТЬ"
      :value="avgEfficiency"
      unit="%"
      trend="down"
      subtitle="-2.1% к прошлому периоду"
    />
    <MetricCard
      title="АВАРИЙНЫЕ ОСТАНОВКИ"
      :value="String(malfunctionCount)"
      unit="ШТ"
      trend="down"
      status="warning"
      subtitle="Текущий статус"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MetricCard from '@/components/MetricCard.vue'

const props = defineProps({
  equipment: { type: Array, required: true },
})

const workingCount = computed(() => props.equipment.filter((e) => e.status === 'working').length)

const malfunctionCount = computed(
  () => props.equipment.filter((e) => e.status === 'malfunction').length,
)

const workingPercent = computed(() =>
  Math.round((workingCount.value / (props.equipment.length || 1)) * 100),
)

const avgEfficiency = computed(() => {
  if (!props.equipment.length) return '0'
  const total = props.equipment.reduce((sum, eq) => {
    if (eq.status === 'working') return sum + 85 + (eq.id.charCodeAt(eq.id.length - 1) % 10)
    if (eq.status === 'idle') return sum
    return sum + 35 + (eq.id.charCodeAt(eq.id.length - 1) % 15)
  }, 0)
  const active = props.equipment.filter((e) => e.status !== 'idle').length || 1
  return (total / active).toFixed(1)
})
</script>
