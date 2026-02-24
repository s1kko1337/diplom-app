import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as dashboardsApi from '@/api/dashboards'

export const useDashboardsStore = defineStore('dashboards', () => {
  const configs = ref({})
  const loading = ref(false)
  const editing = ref(false)

  async function loadConfig(equipmentId) {
    loading.value = true
    try {
      configs.value[equipmentId] = await dashboardsApi.getConfig(equipmentId)
    } finally {
      loading.value = false
    }
  }

  function getConfig(equipmentId) {
    return configs.value[equipmentId] || null
  }

  function getWidgets(equipmentId) {
    return configs.value[equipmentId]?.widgets || []
  }

  function getLayout(equipmentId) {
    return getWidgets(equipmentId).map((w) => w.layout)
  }

  async function saveConfig(equipmentId) {
    const config = configs.value[equipmentId]
    if (!config) return
    await dashboardsApi.saveConfig(equipmentId, config)
  }

  async function resetConfig(equipmentId) {
    const config = await dashboardsApi.resetConfig(equipmentId)
    configs.value[equipmentId] = config
  }

  function updateLayout(equipmentId, newLayout) {
    const config = configs.value[equipmentId]
    if (!config) return
    for (const layoutItem of newLayout) {
      const widget = config.widgets.find((w) => w.id === layoutItem.i)
      if (widget) {
        widget.layout = { ...layoutItem }
      }
    }
  }

  function addWidget(equipmentId, widget) {
    const config = configs.value[equipmentId]
    if (!config) return
    config.widgets.push(widget)
  }

  function removeWidget(equipmentId, widgetId) {
    const config = configs.value[equipmentId]
    if (!config) return
    config.widgets = config.widgets.filter((w) => w.id !== widgetId)
  }

  function toggleEditing() {
    editing.value = !editing.value
  }

  return {
    configs,
    loading,
    editing,
    loadConfig,
    getConfig,
    getWidgets,
    getLayout,
    saveConfig,
    resetConfig,
    updateLayout,
    addWidget,
    removeWidget,
    toggleEditing,
  }
})
