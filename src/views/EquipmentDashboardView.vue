<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <RouterLink
          to="/"
          class="p-3 border-2 border-border hover:bg-surface-2 transition-all duration-150"
        >
          <ArrowLeft class="w-5 h-5" />
        </RouterLink>
        <div>
          <h2 class="text-2xl">{{ equipmentId }}</h2>
          <div class="text-sm opacity-50 mt-1">Панель мониторинга</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="dashboardsStore.editing"
          class="flex items-center gap-2 px-4 py-2 border border-border text-sm hover:bg-surface-2 transition-all duration-150"
          @click="showAddWidget = true"
        >
          <Plus class="w-4 h-4" />
          <span>ВИДЖЕТ</span>
        </button>
        <button
          v-if="dashboardsStore.editing"
          class="flex items-center gap-2 px-4 py-2 border border-border text-sm hover:bg-surface-2 transition-all duration-150"
          @click="handleReset"
        >
          <RotateCcw class="w-4 h-4" />
          <span>СБРОС</span>
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 border-2 text-sm transition-all duration-150"
          :class="
            dashboardsStore.editing
              ? 'border-primary bg-surface-2'
              : 'border-border hover:bg-surface-2'
          "
          @click="toggleEdit"
        >
          <component :is="dashboardsStore.editing ? Save : Pencil" class="w-4 h-4" />
          <span>{{ dashboardsStore.editing ? 'СОХРАНИТЬ' : 'НАСТРОИТЬ' }}</span>
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="dashboardsStore.loading" />

    <GridLayout
      v-else-if="layout.length"
      :layout="layout"
      :col-num="12"
      :row-height="60"
      :margin="[12, 12]"
      :is-draggable="dashboardsStore.editing"
      :is-resizable="dashboardsStore.editing"
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

    <div v-else class="text-center py-12 border-2 border-border border-dashed opacity-50">
      <div class="text-sm mb-2">НЕТ ВИДЖЕТОВ</div>
      <button
        class="px-4 py-2 border border-border text-xs hover:bg-surface-2 transition-all duration-150"
        @click="dashboardsStore.toggleEditing();showAddWidget = true"
      >
        ДОБАВИТЬ ВИДЖЕТ
      </button>
    </div>

    <AddWidgetModal
      :show="showAddWidget"
      :sensors="sensorDefs"
      @close="showAddWidget = false"
      @add="handleAddWidget"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Pencil, Save, Plus, RotateCcw } from 'lucide-vue-next'
import { GridLayout, GridItem } from 'grid-layout-plus'
import { useDashboardsStore } from '@/stores/dashboards'
import { useSensorsStore } from '@/stores/sensors'
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue'
import AddWidgetModal from '@/components/widgets/AddWidgetModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const dashboardsStore = useDashboardsStore()
const sensorsStore = useSensorsStore()

const equipmentId = computed(() => route.params.id)
const showAddWidget = ref(false)

const layout = computed(() => dashboardsStore.getLayout(equipmentId.value))
const sensorDefs = computed(() => sensorsStore.getSensorDefs(equipmentId.value))

onMounted(async () => {
  await Promise.all([
    dashboardsStore.loadConfig(equipmentId.value),
    sensorsStore.loadSensorDefs(equipmentId.value),
  ])
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
}

function handleRemoveWidget(widgetId) {
  dashboardsStore.removeWidget(equipmentId.value, widgetId)
}

let widgetCounter = 100

function handleAddWidget({ type, sensorId, defaultSize }) {
  const id = `w-${Date.now()}-${widgetCounter++}`
  const sensor = sensorDefs.value.find((s) => s.id === sensorId)
  dashboardsStore.addWidget(equipmentId.value, {
    id,
    type,
    sensorId,
    props: { title: sensor?.label || sensorId },
    layout: { x: 0, y: 0, w: defaultSize.w, h: defaultSize.h, i: id },
  })
  showAddWidget.value = false
}
</script>
