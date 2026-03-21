<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Обзор системы</h1>

    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <HomeMetricsPanel :equipment="equipmentStore.list" />
      <HomeCharts :equipment-id="firstWorkingId" />
      <HomeEquipmentGrid :equipment="equipmentStore.list" />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import HomeMetricsPanel from '@/components/home/HomeMetricsPanel.vue'
import HomeCharts from '@/components/home/HomeCharts.vue'
import HomeEquipmentGrid from '@/components/home/HomeEquipmentGrid.vue'

const equipmentStore = useEquipmentStore()

const firstWorkingId = computed(
  () => equipmentStore.list.find((e) => e.status === 'working')?.id ?? null,
)

onMounted(() => {
  if (!equipmentStore.list.length) {
    equipmentStore.fetchList()
  }
})
</script>
