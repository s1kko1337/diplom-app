<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <!-- Loading -->
    <LoadingSpinner v-if="ordersLoading" />

    <!-- Not found -->
    <div v-else-if="!currentOrder" class="text-center py-12 text-muted-foreground">
      Наряд не найден
    </div>

    <!-- Document -->
    <template v-else>
      <!-- Action buttons -->
      <div class="no-print flex items-center gap-3 mb-6">
        <Button variant="outline" @click="goBack">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Назад к наряду
        </Button>
        <Button @click="handlePrint">
          <Printer class="w-4 h-4 mr-2" />
          Печать
        </Button>
      </div>

      <!-- EO checklist -->
      <DocumentEoView
        v-if="currentOrder.type === 'ЕО'"
        :order="currentOrder"
        :equipment="equipment"
      />

      <!-- TO-1/2/3 and TR/KR act -->
      <DocumentActView v-else :order="currentOrder" :equipment="equipment" />
    </template>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ArrowLeft, Printer } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import DocumentEoView from '@/components/maintenance/DocumentEoView.vue'
import DocumentActView from '@/components/maintenance/DocumentActView.vue'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useEquipmentStore } from '@/stores/equipment'

const route = useRoute()
const router = useRouter()
const maintenanceStore = useMaintenanceStore()
const equipmentStore = useEquipmentStore()
const { currentOrder, ordersLoading } = storeToRefs(maintenanceStore)

const id = computed(() => route.params.id)

const equipment = computed(() => {
  if (!currentOrder.value) return null
  return equipmentStore.getDetail(currentOrder.value.equipmentId)
})

watch(
  id,
  async (val) => {
    if (val) {
      await maintenanceStore.loadOrder(val)
      if (currentOrder.value) {
        await equipmentStore.fetchById(currentOrder.value.equipmentId)
      }
    }
  },
  { immediate: true },
)

function handlePrint() {
  window.print()
}

function goBack() {
  router.push(`/maintenance/${id.value}`)
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
