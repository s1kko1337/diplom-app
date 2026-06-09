<template>
  <div class="space-y-4">
    <!-- Edit toolbar -->
    <div class="flex items-center justify-end gap-2 flex-wrap">
      <Button
        v-if="dashboardsStore.editing"
        variant="outline"
        size="sm"
        class="min-h-11 sm:min-h-0"
        @click="showAddWidget = true"
      >
        <Plus class="w-4 h-4" />
        Виджет
      </Button>
      <Button
        v-if="dashboardsStore.editing"
        variant="outline"
        size="sm"
        class="min-h-11 sm:min-h-0"
        @click="handleReset"
      >
        <RotateCcw class="w-4 h-4" />
        Сброс
      </Button>
      <Button
        :variant="dashboardsStore.editing ? 'default' : 'outline'"
        size="sm"
        class="min-h-11 sm:min-h-0"
        @click="toggleEdit"
      >
        <component :is="dashboardsStore.editing ? Save : Pencil" class="w-4 h-4" />
        {{ dashboardsStore.editing ? 'Сохранить' : 'Настроить' }}
      </Button>
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
          :equipment-id="dataEquipmentId"
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
import { Pencil, Save, Plus, RotateCcw } from 'lucide-vue-next'
import { GridLayout, GridItem } from 'grid-layout-plus'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useDashboardsStore } from '@/stores/dashboards'
import { useSensorsStore } from '@/stores/sensors'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue'
import AddWidgetModal from '@/components/widgets/AddWidgetModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const props = defineProps({
  // Ключ конфигурации раскладки (id оборудования или role:<role>).
  configKey: { type: String, required: true },
  // Источник данных для виджетов (id оборудования, чьи датчики показываем).
  dataEquipmentId: { type: String, required: true },
  // Управлять ли опросом датчиков самостоятельно (false — если опрашивает родитель).
  managePolling: { type: Boolean, default: true },
})

const { isMobile } = useBreakpoint()
const dashboardsStore = useDashboardsStore()
const sensorsStore = useSensorsStore()

const showAddWidget = ref(false)

// IMPORTANT: layout MUST be a mutable ref, NOT computed.
// grid-layout-plus mutates the array in-place during drag/resize.
const layout = ref([])
const sensorDefs = computed(() => sensorsStore.getSensorDefs(props.dataEquipmentId))

function syncLayoutFromStore() {
  const items = dashboardsStore.getLayout(props.configKey).map((item) => ({ ...item }))
  if (isMobile.value) {
    items.forEach((item, idx) => {
      item.x = 0
      item.w = 1
      item.y = idx
    })
  }
  layout.value = items
}

watch(isMobile, () => {
  if (layout.value.length) {
    syncLayoutFromStore()
  }
})

// Источник данных может меняться (выбор оборудования в персональном дашборде).
watch(
  () => props.dataEquipmentId,
  async (id, prev) => {
    if (!id || id === prev) return
    await sensorsStore.loadSensorDefs(id)
    if (props.managePolling) {
      sensorsStore.startPolling(id, 5000)
    }
  },
)

onMounted(async () => {
  await dashboardsStore.loadConfig(props.configKey)
  if (props.dataEquipmentId) {
    await sensorsStore.loadSensorDefs(props.dataEquipmentId)
    if (props.managePolling) {
      sensorsStore.startPolling(props.dataEquipmentId, 5000)
    }
  }
  syncLayoutFromStore()
})

onUnmounted(() => {
  if (props.managePolling) {
    sensorsStore.stopPolling()
  }
  if (dashboardsStore.editing) {
    dashboardsStore.editing = false
  }
})

function getWidget(widgetId) {
  const widgets = dashboardsStore.getWidgets(props.configKey)
  return widgets.find((w) => w.id === widgetId) || { id: widgetId, type: 'unknown', props: {} }
}

function handleLayoutUpdate(newLayout) {
  dashboardsStore.updateLayout(props.configKey, newLayout)
}

async function toggleEdit() {
  if (dashboardsStore.editing) {
    await dashboardsStore.saveConfig(props.configKey)
  }
  dashboardsStore.toggleEditing()
}

async function handleReset() {
  await dashboardsStore.resetConfig(props.configKey)
  syncLayoutFromStore()
}

function handleStartAdding() {
  dashboardsStore.toggleEditing()
  showAddWidget.value = true
}

function handleRemoveWidget(widgetId) {
  dashboardsStore.removeWidget(props.configKey, widgetId)
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
  dashboardsStore.addWidget(props.configKey, {
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
