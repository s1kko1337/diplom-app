<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3 sm:gap-4">
        <Button variant="outline" size="icon" class="min-h-[44px] min-w-[44px]" as-child>
          <RouterLink to="/">
            <ArrowLeft class="w-5 h-5" />
          </RouterLink>
        </Button>
        <div>
          <h2 class="text-xl sm:text-2xl font-semibold">{{ equipmentId }}</h2>
          <div class="text-xs sm:text-sm text-muted-foreground mt-1">Панель мониторинга</div>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <Button
          v-if="dashboardsStore.editing"
          variant="outline"
          size="sm"
          class="min-h-[44px] sm:min-h-0"
          @click="showAddWidget = true"
        >
          <Plus class="w-4 h-4" />
          Виджет
        </Button>
        <Button
          v-if="dashboardsStore.editing"
          variant="outline"
          size="sm"
          class="min-h-[44px] sm:min-h-0"
          @click="handleReset"
        >
          <RotateCcw class="w-4 h-4" />
          Сброс
        </Button>
        <Button
          :variant="dashboardsStore.editing ? 'default' : 'outline'"
          size="sm"
          class="min-h-[44px] sm:min-h-0"
          @click="toggleEdit"
        >
          <component :is="dashboardsStore.editing ? Save : Pencil" class="w-4 h-4" />
          {{ dashboardsStore.editing ? 'Сохранить' : 'Настроить' }}
        </Button>
      </div>
    </div>

    <LoadingSpinner v-if="dashboardsStore.loading" />

    <GridLayout
      v-else-if="layout.length"
      v-model:layout="layout"
      :col-num="isMobile ? 1 : 12"
      :row-height="isMobile ? 80 : 60"
      :margin="isMobile ? [8, 8] : [12, 12]"
      :is-draggable="!isMobile && dashboardsStore.editing"
      :is-resizable="!isMobile && dashboardsStore.editing"
      @layout-updated="handleLayoutUpdate"
    >
      <GridItem
        v-for="item in layout"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        class="relative"
      >
        <WidgetWrapper
          :widget="getWidget(item.i)"
          :equipment-id="equipmentId"
          :editing="dashboardsStore.editing"
          @remove="handleRemoveWidget(item.i)"
        />
      </GridItem>
    </GridLayout>

    <Card v-else class="border-dashed">
      <CardContent class="text-center py-12">
        <div class="text-sm text-muted-foreground mb-3">Нет виджетов</div>
        <Button variant="outline" size="sm" @click="handleStartAdding"> Добавить виджет </Button>
      </CardContent>
    </Card>

    <AddWidgetModal
      :show="showAddWidget"
      :sensors="sensorDefs"
      @close="showAddWidget = false"
      @add="handleAddWidget"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Pencil, Save, Plus, RotateCcw } from 'lucide-vue-next'
import { GridLayout, GridItem } from 'grid-layout-plus'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useDashboardsStore } from '@/stores/dashboards'
import { useSensorsStore } from '@/stores/sensors'
import { useEquipmentStore } from '@/stores/equipment'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue'
import AddWidgetModal from '@/components/widgets/AddWidgetModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const { isMobile } = useBreakpoint()
const dashboardsStore = useDashboardsStore()
const sensorsStore = useSensorsStore()
const equipmentStore = useEquipmentStore()

const equipmentId = computed(() => route.params.id)
const showAddWidget = ref(false)

// IMPORTANT: layout MUST be a mutable ref, NOT computed.
// grid-layout-plus mutates the array in-place during drag/resize.
const layout = ref([])
const sensorDefs = computed(() => sensorsStore.getSensorDefs(equipmentId.value))

function syncLayoutFromStore() {
  const items = dashboardsStore.getLayout(equipmentId.value).map((item) => ({ ...item }))
  if (isMobile.value) {
    items.forEach((item, idx) => {
      item.x = 0
      item.w = 1
      item.y = idx
    })
  }
  layout.value = items
}

// Re-sync layout when breakpoint changes to/from mobile
watch(isMobile, () => {
  if (layout.value.length) {
    syncLayoutFromStore()
  }
})

onMounted(async () => {
  await Promise.all([
    dashboardsStore.loadConfig(equipmentId.value),
    sensorsStore.loadSensorDefs(equipmentId.value),
    equipmentStore.fetchById(equipmentId.value),
  ])
  syncLayoutFromStore()
  sensorsStore.startPolling(equipmentId.value, 5000)
})

onUnmounted(() => {
  sensorsStore.stopPolling()
  if (dashboardsStore.editing) {
    dashboardsStore.editing = false
  }
})

function getWidget(widgetId) {
  const widgets = dashboardsStore.getWidgets(equipmentId.value)
  return widgets.find((w) => w.id === widgetId) || { id: widgetId, type: 'unknown', props: {} }
}

function handleLayoutUpdate(newLayout) {
  dashboardsStore.updateLayout(equipmentId.value, newLayout)
}

async function toggleEdit() {
  if (dashboardsStore.editing) {
    await dashboardsStore.saveConfig(equipmentId.value)
  }
  dashboardsStore.toggleEditing()
}

async function handleReset() {
  await dashboardsStore.resetConfig(equipmentId.value)
  syncLayoutFromStore()
}

function handleStartAdding() {
  dashboardsStore.toggleEditing()
  showAddWidget.value = true
}

function handleRemoveWidget(widgetId) {
  dashboardsStore.removeWidget(equipmentId.value, widgetId)
  syncLayoutFromStore()
}

let widgetCounter = 100

function handleAddWidget({ type, sensorId, defaultSize }) {
  const id = `w-${Date.now()}-${widgetCounter++}`
  let title = type
  if (sensorId) {
    const sensor = sensorDefs.value.find((s) => s.id === sensorId)
    title = sensor?.label || sensorId
  }
  dashboardsStore.addWidget(equipmentId.value, {
    id,
    type,
    sensorId,
    props: { title },
    layout: { x: 0, y: 0, w: defaultSize.w, h: defaultSize.h, i: id },
  })
  syncLayoutFromStore()
  showAddWidget.value = false
}
</script>
