<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !current" />

    <template v-else-if="current">
      <EquipmentHeader
        :equipment="current"
        :is-polling="sensorsStore.pollingActive"
        @toggle-polling="handleTogglePolling"
      />

      <Tabs v-model="activeTab">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="sensors">Датчики</TabsTrigger>
            <TabsTrigger value="maintenance">ТО</TabsTrigger>
            <TabsTrigger value="parts">Детали</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
            <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
          </TabsList>
          <Button
            v-if="isCustomizableTab"
            :variant="customizing ? 'default' : 'outline'"
            size="sm"
            @click="customizing = !customizing"
          >
            <component :is="customizing ? Check : SlidersHorizontal" class="w-4 h-4" />
            {{ customizing ? 'Готово' : 'Настроить' }}
          </Button>
        </div>

        <TabsContent value="overview">
          <CustomizableSections
            page-key="equipment-overview"
            :sections="overviewSections"
            v-model:editing="customizing"
            hide-toolbar
          >
            <template #metrics>
              <EquipmentMetrics :equipment-id="equipmentId" />
            </template>
            <template #status>
              <EquipmentStatusBars :equipment-id="equipmentId" />
            </template>
            <template #charts>
              <EquipmentCharts :equipment-id="equipmentId" />
            </template>
          </CustomizableSections>
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

        <TabsContent value="dashboard">
          <DashboardCanvas
            :config-key="equipmentId"
            :data-equipment-id="equipmentId"
            :manage-polling="false"
            v-model:editing="customizing"
            hide-toggle
          />
        </TabsContent>
      </Tabs>
    </template>

    <div v-else class="text-center py-12 opacity-50">
      <div class="text-sm">ОБОРУДОВАНИЕ НЕ НАЙДЕНО</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { SlidersHorizontal, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
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
import DashboardCanvas from '@/components/dashboard/DashboardCanvas.vue'
import CustomizableSections from '@/components/customize/CustomizableSections.vue'

const overviewSections = [
  { id: 'metrics', label: 'Ключевые метрики' },
  { id: 'status', label: 'Состояние систем' },
  { id: 'charts', label: 'Графики' },
]

const route = useRoute()
const equipmentStore = useEquipmentStore()
const sensorsStore = useSensorsStore()

const equipmentId = computed(() => route.params.id)
const current = computed(() => equipmentStore.getDetail(equipmentId.value))

// Активная вкладка и единая кнопка «Настроить» в строке вкладок.
// Кастомизируются только «Обзор» (секции) и «Дашборд» (виджеты).
const activeTab = ref('overview')
const customizing = ref(false)
const isCustomizableTab = computed(
  () => activeTab.value === 'overview' || activeTab.value === 'dashboard',
)

// При смене вкладки выходим из режима редактирования, чтобы он не «переносился».
watch(activeTab, () => {
  customizing.value = false
})

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
