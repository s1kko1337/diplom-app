import { useAlertsStore } from '@/stores/alerts'
import { useSensorsStore } from '@/stores/sensors'

const activeViolations = new Map()

export function useThresholdMonitor() {
  const alertsStore = useAlertsStore()
  const sensorsStore = useSensorsStore()

  function checkThresholds(equipmentId) {
    const defs = sensorsStore.getSensorDefs(equipmentId)
    const liveData = sensorsStore.liveData[equipmentId]
    if (!defs.length || !liveData) return

    for (const sensor of defs) {
      const live = liveData[sensor.id]
      if (!live || !sensor.thresholds) continue

      const key = `${equipmentId}:${sensor.id}`
      const value = live.value

      if (value >= sensor.thresholds.critical) {
        if (!activeViolations.has(key) || activeViolations.get(key) !== 'critical') {
          activeViolations.set(key, 'critical')
          alertsStore.addLiveAlert({
            type: 'critical',
            title: `${sensor.label}: КРИТИЧЕСКОЕ ЗНАЧЕНИЕ`,
            description: `${sensor.label} = ${value} ${sensor.unit} (порог: ${sensor.thresholds.critical} ${sensor.unit})`,
            equipmentId,
            sensorId: sensor.id,
            value,
            threshold: sensor.thresholds.critical,
          })
        }
      } else if (value >= sensor.thresholds.warning) {
        if (!activeViolations.has(key) || activeViolations.get(key) !== 'warning') {
          activeViolations.set(key, 'warning')
          alertsStore.addLiveAlert({
            type: 'warning',
            title: `${sensor.label}: ПРЕВЫШЕНИЕ ПОРОГА`,
            description: `${sensor.label} = ${value} ${sensor.unit} (порог: ${sensor.thresholds.warning} ${sensor.unit})`,
            equipmentId,
            sensorId: sensor.id,
            value,
            threshold: sensor.thresholds.warning,
          })
        }
      } else {
        activeViolations.delete(key)
      }
    }
  }

  function clearViolations(equipmentId) {
    for (const key of activeViolations.keys()) {
      if (key.startsWith(equipmentId + ':')) {
        activeViolations.delete(key)
      }
    }
  }

  return { checkThresholds, clearViolations }
}
