import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as equipmentApi from '@/api/equipment'
import { useConnectionStore } from '@/stores/connection'
import { useThresholdMonitor } from '@/composables/useThresholdMonitor'

export const useSensorsStore = defineStore('sensors', () => {
  const liveData = ref({})
  const sensorDefs = ref({})
  const pollingEquipmentId = ref(null)
  const pollingActive = ref(false)
  let pollingTimer = null

  async function loadSensorDefs(equipmentId) {
    const sensors = await equipmentApi.getSensors(equipmentId)
    sensorDefs.value[equipmentId] = sensors
  }

  async function fetchLive(equipmentId) {
    const connectionStore = useConnectionStore()
    try {
      const data = await equipmentApi.getLiveData(equipmentId)
      liveData.value[equipmentId] = data
      connectionStore.reportSuccess()
      return data
    } catch (e) {
      connectionStore.reportFailure()
      throw e
    }
  }

  function startPolling(equipmentId, interval = 5000) {
    stopPolling()
    pollingEquipmentId.value = equipmentId
    pollingActive.value = true
    const { checkThresholds } = useThresholdMonitor()

    const poll = async () => {
      if (!pollingActive.value) return
      try {
        await fetchLive(equipmentId)
        checkThresholds(equipmentId)
      } catch {
        // connection store handles status
      }
    }

    poll()
    pollingTimer = setInterval(poll, interval)
  }

  function stopPolling() {
    pollingActive.value = false
    pollingEquipmentId.value = null
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  function getSensorValue(equipmentId, sensorId) {
    return liveData.value[equipmentId]?.[sensorId]?.value ?? null
  }

  function getSensorDefs(equipmentId) {
    return sensorDefs.value[equipmentId] || []
  }

  return {
    liveData,
    sensorDefs,
    pollingActive,
    pollingEquipmentId,
    loadSensorDefs,
    fetchLive,
    startPolling,
    stopPolling,
    getSensorValue,
    getSensorDefs,
  }
})
