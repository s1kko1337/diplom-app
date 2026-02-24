import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as alertsApi from '@/api/alerts'

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const showCriticalAlert = ref(false)

  const criticalAlerts = computed(() =>
    alerts.value.filter((a) => a.type === 'critical' && !a.acknowledged),
  )

  const hasCriticalAlerts = computed(() => criticalAlerts.value.length > 0)

  const criticalAlertCount = computed(() => criticalAlerts.value.length)

  const criticalAlert = computed(() => {
    const first = criticalAlerts.value[0]
    if (!first) return { title: '', equipment: '', description: '' }
    return {
      title: first.title,
      equipment: first.equipmentId,
      description: first.description,
    }
  })

  const unacknowledgedCount = computed(() => alerts.value.filter((a) => !a.acknowledged).length)

  async function fetchAlerts(equipmentId) {
    loading.value = true
    error.value = null
    try {
      alerts.value = await alertsApi.getAlerts(equipmentId)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function acknowledgeAlert(id) {
    try {
      await alertsApi.acknowledge(id)
    } catch {
      // live-алерты могут не найтись в mock db
    }
    const idx = alerts.value.findIndex((a) => a.id === id)
    if (idx !== -1) {
      alerts.value[idx] = { ...alerts.value[idx], acknowledged: true }
    }
  }

  function dismissAlert(id) {
    alerts.value = alerts.value.filter((a) => a.id !== id)
  }

  function alertsByEquipment(equipmentId) {
    return alerts.value.filter((a) => a.equipmentId === equipmentId)
  }

  function openCriticalAlert() {
    showCriticalAlert.value = true
  }

  function closeCriticalAlert() {
    showCriticalAlert.value = false
  }

  let liveCounter = 1000

  function addLiveAlert(data) {
    const existing = alerts.value.find(
      (a) =>
        a.equipmentId === data.equipmentId &&
        a.sensorId === data.sensorId &&
        a.type === data.type &&
        !a.acknowledged,
    )
    if (existing) return

    const alert = {
      ...data,
      id: `L-${liveCounter++}`,
      timestamp: new Date().toLocaleString('ru-RU'),
      acknowledged: false,
    }
    alerts.value.unshift(alert)

    if (data.type === 'critical') {
      showCriticalAlert.value = true
    }
  }

  return {
    alerts,
    loading,
    error,
    showCriticalAlert,
    criticalAlerts,
    hasCriticalAlerts,
    criticalAlertCount,
    criticalAlert,
    unacknowledgedCount,
    fetchAlerts,
    acknowledgeAlert,
    dismissAlert,
    alertsByEquipment,
    openCriticalAlert,
    closeCriticalAlert,
    addLiveAlert,
  }
})
