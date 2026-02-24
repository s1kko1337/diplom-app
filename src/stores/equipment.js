import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as equipmentApi from '@/api/equipment'

export const useEquipmentStore = defineStore('equipment', () => {
  const list = ref([])
  const details = ref({})
  const loading = ref(false)
  const error = ref(null)

  const workingCount = computed(() => list.value.filter((e) => e.status === 'working').length)
  const idleCount = computed(() => list.value.filter((e) => e.status === 'idle').length)
  const malfunctionCount = computed(
    () => list.value.filter((e) => e.status === 'malfunction').length,
  )
  const offlineCount = computed(() => list.value.filter((e) => e.status === 'offline').length)

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      list.value = await equipmentApi.getList()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    loading.value = true
    error.value = null
    try {
      const data = await equipmentApi.getById(id)
      details.value[id] = data
      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  function getDetail(id) {
    return details.value[id] || null
  }

  return {
    list,
    details,
    loading,
    error,
    workingCount,
    idleCount,
    malfunctionCount,
    offlineCount,
    fetchList,
    fetchById,
    getDetail,
  }
})
