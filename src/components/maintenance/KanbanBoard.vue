<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 gap-4"
    :class="showCancelled ? 'xl:grid-cols-5' : 'xl:grid-cols-4'"
  >
    <KanbanColumn title="Запланировано" :orders="plannedOrders" color="bg-status-info" />
    <KanbanColumn title="В работе" :orders="inProgressOrders" color="bg-status-warning" />
    <KanbanColumn title="На приёмке" :orders="reviewOrders" color="bg-status-maintenance" />
    <KanbanColumn
      title="Завершено"
      :orders="completedOrders"
      color="bg-status-success"
      :limit="10"
    />
    <KanbanColumn
      v-if="showCancelled"
      title="Отменено"
      :orders="cancelledOrders"
      color="bg-muted-foreground"
      :limit="10"
    />
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

const completedOrders = computed(() => props.orders.filter((o) => o.status === 'completed'))

const cancelledOrders = computed(() => props.orders.filter((o) => o.status === 'cancelled'))
</script>

<style scoped></style>
