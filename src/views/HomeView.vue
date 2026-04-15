<template>
  <div class="space-y-6">
    <h1 class="text-xl sm:text-2xl font-semibold">Обзор системы</h1>

    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <HomeMetricsPanel :equipment="equipmentStore.list" />
      <HomeMaintenanceSummary />
      <HomeUpcomingMaintenance />
      <HomeEquipmentGrid :equipment="equipmentStore.list" />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import { useMaintenanceStore } from '@/stores/maintenance'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import HomeMetricsPanel from '@/components/home/HomeMetricsPanel.vue'
import HomeMaintenanceSummary from '@/components/home/HomeMaintenanceSummary.vue'
import HomeUpcomingMaintenance from '@/components/home/HomeUpcomingMaintenance.vue'
import HomeEquipmentGrid from '@/components/home/HomeEquipmentGrid.vue'

const equipmentStore = useEquipmentStore()
const maintenanceStore = useMaintenanceStore()

onMounted(async () => {
  const tasks = []
  if (!equipmentStore.list.length) tasks.push(equipmentStore.fetchList())
  if (!maintenanceStore.orders.length) tasks.push(maintenanceStore.loadOrders().catch(() => {}))
  await Promise.all(tasks)

  // Preload details so getNextMaintenance has operatingHours for every machine
  await Promise.all(
    equipmentStore.list
      .filter((e) => !equipmentStore.getDetail(e.id))
      .map((e) => equipmentStore.fetchById(e.id)),
  )
})
</script>
