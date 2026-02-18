import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAlertsStore = defineStore('alerts', () => {
  const criticalAlertCount = ref(2)
  const showCriticalAlert = ref(false)

  const criticalAlert = {
    title: 'КРИТИЧЕСКАЯ ТЕМПЕРАТУРА',
    equipment: 'БУР-03',
    description:
      'Температура двигателя превысила допустимый предел 95°C. Требуется немедленная остановка оборудования для предотвращения повреждений.',
  }

  const hasCriticalAlerts = computed(() => criticalAlertCount.value > 0)

  function openCriticalAlert() {
    showCriticalAlert.value = true
  }

  function closeCriticalAlert() {
    showCriticalAlert.value = false
    criticalAlertCount.value = Math.max(0, criticalAlertCount.value - 1)
  }

  return {
    criticalAlertCount,
    showCriticalAlert,
    criticalAlert,
    hasCriticalAlerts,
    openCriticalAlert,
    closeCriticalAlert,
  }
})
