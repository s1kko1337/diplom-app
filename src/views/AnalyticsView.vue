<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 class="text-xl sm:text-2xl font-semibold">Аналитика</h1>
        <AnalyticsPeriodSelector v-model="period" />
      </div>

      <AnalyticsKPICards :equipment="equipmentStore.list" />
      <AnalyticsCharts :equipment="equipmentStore.list" :period="period" />
      <EfficiencyTable :equipment="equipmentStore.list" />
      <MaintenanceStats />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import AnalyticsPeriodSelector from '@/components/analytics/AnalyticsPeriodSelector.vue'
import AnalyticsKPICards from '@/components/analytics/AnalyticsKPICards.vue'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts.vue'
import EfficiencyTable from '@/components/analytics/EfficiencyTable.vue'
import MaintenanceStats from '@/components/analytics/MaintenanceStats.vue'

const equipmentStore = useEquipmentStore()
const period = ref('6months')

onMounted(() => {
  if (!equipmentStore.list.length) {
    equipmentStore.fetchList()
  }
})
</script>
