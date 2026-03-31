<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !current" />

    <template v-else-if="current">
      <EquipmentHeader
        :equipment="current"
        :is-polling="sensorsStore.pollingActive"
        @toggle-polling="handleTogglePolling"
      />

      <Tabs default-value="overview">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="sensors">Датчики</TabsTrigger>
          <TabsTrigger value="maintenance">ТО</TabsTrigger>
          <TabsTrigger value="parts">Детали</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" class="space-y-6">
          <EquipmentMetrics :equipment-id="equipmentId" />
          <EquipmentStatusBars :equipment-id="equipmentId" />
          <EquipmentCharts :equipment-id="equipmentId" />
        </TabsContent>

        <TabsContent value="sensors">
          <EquipmentSensors :equipment-id="equipmentId" :sensors="current.sensors || []" />
        </TabsContent>

        <TabsContent value="maintenance" class="space-y-6">
          <MaintenanceTab :equipment-id="equipmentId" :equipment="current" />
        </TabsContent>

        <TabsContent value="parts">
          <EquipmentParts :equipment-id="equipmentId" />
        </TabsContent>

        <TabsContent value="history" class="space-y-6">
          <SensorHistoryExplorer :equipment-id="equipmentId" :sensors="current.sensors || []" />
          <EquipmentSpecs :equipment="current" />
        </TabsContent>
      </Tabs>
    </template>

    <div v-else class="text-center py-12 opacity-50">
      <div class="text-sm">ОБОРУДОВАНИЕ НЕ НАЙДЕНО</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEquipmentStore } from '@/stores/equipment'
import { useSensorsStore } from '@/stores/sensors'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EquipmentHeader from '@/components/equipment/EquipmentHeader.vue'
import EquipmentMetrics from '@/components/equipment/EquipmentMetrics.vue'
import EquipmentCharts from '@/components/equipment/EquipmentCharts.vue'
import EquipmentStatusBars from '@/components/equipment/EquipmentStatusBars.vue'
import EquipmentSpecs from '@/components/equipment/EquipmentSpecs.vue'
import EquipmentParts from '@/components/equipment/EquipmentParts.vue'
import SensorHistoryExplorer from '@/components/equipment/SensorHistoryExplorer.vue'
import EquipmentSensors from '@/components/equipment/EquipmentSensors.vue'
import MaintenanceTab from '@/components/equipment/MaintenanceTab.vue'

const route = useRoute()
const equipmentStore = useEquipmentStore()
const sensorsStore = useSensorsStore()

const equipmentId = computed(() => route.params.id)
const current = computed(() => equipmentStore.getDetail(equipmentId.value))

onMounted(async () => {
  await equipmentStore.fetchById(equipmentId.value)
  sensorsStore.startPolling(equipmentId.value, 5000)
})

onUnmounted(() => {
  sensorsStore.stopPolling()
})

function handleTogglePolling() {
  if (sensorsStore.pollingActive) {
    sensorsStore.stopPolling()
  } else {
    sensorsStore.startPolling(equipmentId.value, 5000)
  }
}
</script>
