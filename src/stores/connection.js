import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConnectionStore = defineStore('connection', () => {
  const status = ref('connected')
  const lastSuccessfulUpdate = ref(new Date().toISOString())
  const consecutiveFailures = ref(0)

  const isOnline = computed(() => status.value === 'connected')
  const isReconnecting = computed(() => status.value === 'reconnecting')
  const isDisconnected = computed(() => status.value === 'disconnected')

  function reportSuccess() {
    consecutiveFailures.value = 0
    status.value = 'connected'
    lastSuccessfulUpdate.value = new Date().toISOString()
  }

  function reportFailure() {
    consecutiveFailures.value++
    if (consecutiveFailures.value >= 3) {
      status.value = 'disconnected'
    } else {
      status.value = 'reconnecting'
    }
  }

  return {
    status,
    lastSuccessfulUpdate,
    consecutiveFailures,
    isOnline,
    isReconnecting,
    isDisconnected,
    reportSuccess,
    reportFailure,
  }
})
