<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <div class="no-print flex items-center gap-3 mb-6">
      <Button variant="outline" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Назад
      </Button>
      <Button @click="handlePrint">
        <Printer class="w-4 h-4 mr-2" />
        Печать
      </Button>
    </div>

    <LoadingSpinner v-if="maintenanceStore.loading && items.length === 0" />

    <ChecklistDocument
      v-else
      :equipment-id="equipmentId"
      :equipment="equipment"
      :items="items"
      :type="type"
      :executor-name="executorName"
      :executor-position="executorPosition"
    />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Printer } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ChecklistDocument from '@/components/maintenance/ChecklistDocument.vue'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useEquipmentStore } from '@/stores/equipment'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const maintenanceStore = useMaintenanceStore()
const equipmentStore = useEquipmentStore()
const authStore = useAuthStore()

const equipmentId = computed(() => route.params.id)
const type = computed(() => route.query.type || 'ЕО')

const items = computed(() => maintenanceStore.checklist)
const equipment = computed(() => equipmentStore.getDetail(equipmentId.value))

const executorName = computed(() => authStore.userName || '—')
const executorPosition = computed(() => ROLE_LABELS[authStore.userRole] || '')

watch(
  [equipmentId, type],
  async ([id, t]) => {
    if (!id) return
    await Promise.all([
      maintenanceStore.loadChecklist(id, t),
      equipmentStore.getDetail(id) ? Promise.resolve() : equipmentStore.fetchById(id),
    ])
  },
  { immediate: true },
)

function handlePrint() {
  window.print()
}

function goBack() {
  router.push(`/equipment/${equipmentId.value}`)
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
