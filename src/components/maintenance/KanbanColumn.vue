<template>
  <div class="flex flex-col gap-2">
    <!-- Header -->
    <div class="rounded-lg border bg-card overflow-hidden">
      <!-- Color accent bar -->
      <div class="h-1 w-full" :class="color" />
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-sm font-semibold">{{ title }}</span>
        <Badge variant="secondary" class="text-xs">{{ orders.length }}</Badge>
      </div>
    </div>

    <!-- Cards -->
    <div class="flex flex-col gap-2">
      <template v-if="orders.length > 0">
        <OrderCard v-for="order in visibleOrders" :key="order.id" :order="order" />
        <div v-if="hasMore && !expanded" class="flex justify-center">
          <Button variant="outline" size="sm" @click="showAll"> Показать все </Button>
        </div>
      </template>
      <div v-else class="text-sm text-muted-foreground text-center py-4">Нет нарядов</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import OrderCard from './OrderCard.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  orders: {
    type: Array,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
    default: null,
  },
})

const expanded = ref(false)

const hasMore = computed(() => props.limit !== null && props.orders.length > props.limit)

const visibleOrders = computed(() => {
  if (!hasMore.value || expanded.value) return props.orders
  return props.orders.slice(0, props.limit)
})

function showAll() {
  expanded.value = true
}
</script>

<style scoped></style>
