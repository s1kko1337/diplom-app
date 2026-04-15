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

  async function createEquipment(data) {
    const created = await equipmentApi.create(data)
    list.value = [created, ...list.value]
    return created
  }

  async function setStatus(id, status) {
    const updated = await equipmentApi.updateStatus(id, status)
    const idx = list.value.findIndex((e) => e.id === id)
    if (idx !== -1) list.value[idx] = updated
    if (details.value[id]) {
      details.value[id] = { ...details.value[id], status: updated.status }
    }
    return updated
  }

  async function deleteEquipment(id) {
    await equipmentApi.remove(id)
    list.value = list.value.filter((e) => e.id !== id)
    delete details.value[id]
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
    createEquipment,
    setStatus,
    deleteEquipment,
  }
})
