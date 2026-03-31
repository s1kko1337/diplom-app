<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    <KanbanColumn title="Запланировано" :orders="plannedOrders" color="bg-blue-500" />
    <KanbanColumn title="В работе" :orders="inProgressOrders" color="bg-yellow-500" />
    <KanbanColumn title="На приёмке" :orders="reviewOrders" color="bg-purple-500" />
    <KanbanColumn title="Завершено" :orders="completedOrders" color="bg-green-500" :limit="10" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import KanbanColumn from './KanbanColumn.vue'

const props = defineProps({
  orders: {
    type: Array,
    required: true,
  },
  showCancelled: {
    type: Boolean,
    default: false,
  },
})

const plannedOrders = computed(() => props.orders.filter((o) => o.status === 'planned'))

const inProgressOrders = computed(() => props.orders.filter((o) => o.status === 'in_progress'))

const reviewOrders = computed(() => props.orders.filter((o) => o.status === 'review'))

const completedOrders = computed(() => {
  const completed = props.orders.filter((o) => o.status === 'completed')
  if (props.showCancelled) {
    return [...completed, ...props.orders.filter((o) => o.status === 'cancelled')]
  }
  return completed
})
</script>

<style scoped></style>
