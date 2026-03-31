<template>
  <div class="space-y-6">
    <!-- Header row -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Техобслуживание</h1>
      <Button v-if="canCreate" @click="navigateToCreate">Создать наряд</Button>
    </div>

    <!-- Filters -->
    <OrderFilters v-model="filters" />

    <!-- Loading -->
    <LoadingSpinner v-if="maintenanceStore.ordersLoading" />

    <!-- Kanban board -->
    <KanbanBoard v-else :orders="filteredOrders" :show-cancelled="filters.showCancelled" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import OrderFilters from '@/components/maintenance/OrderFilters.vue'
import KanbanBoard from '@/components/maintenance/KanbanBoard.vue'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useEquipmentStore } from '@/stores/equipment'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const maintenanceStore = useMaintenanceStore()
const equipmentStore = useEquipmentStore()
const authStore = useAuthStore()
const { canCreate } = usePermissions()

const filters = ref({
  equipmentId: null,
  type: null,
  assignedTo: null,
  myOnly: authStore.userRole === 'mechanic',
  showCancelled: false,
})

const filteredOrders = computed(() => {
  let result = maintenanceStore.orders

  if (filters.value.equipmentId) {
    result = result.filter((o) => o.equipmentId === filters.value.equipmentId)
  }

  if (filters.value.type) {
    result = result.filter((o) => o.type === filters.value.type)
  }

  if (filters.value.assignedTo) {
    result = result.filter((o) => o.assignedTo?.id === filters.value.assignedTo)
  }

  if (filters.value.myOnly) {
    result = result.filter((o) => o.assignedTo?.id === authStore.userId)
  }

  return result
})

function navigateToCreate() {
  router.push('/maintenance/create')
}

onMounted(() => {
  maintenanceStore.loadOrders()
  if (!equipmentStore.list.length) {
    equipmentStore.fetchList()
  }
})
</script>

<style scoped></style>
