import { ref } from 'vue'
import { defineStore } from 'pinia'
import { MAINTENANCE_SCHEDULE } from '@/utils/constants'
import * as maintenanceApi from '@/api/maintenance'
import { useEquipmentStore } from './equipment'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const schedule = ref({})
  const checklist = ref([])
  const loading = ref(false)

  async function loadSchedule(equipmentId) {
    loading.value = true
    try {
      schedule.value[equipmentId] = await maintenanceApi.getSchedule(equipmentId)
    } finally {
      loading.value = false
    }
  }

  async function loadChecklist(equipmentId, type) {
    loading.value = true
    try {
      checklist.value = await maintenanceApi.getChecklist(equipmentId, type)
    } finally {
      loading.value = false
    }
  }

  async function toggleChecklistItem(equipmentId, itemId) {
    await maintenanceApi.completeChecklistItem(equipmentId, itemId)
    const item = checklist.value.find((i) => i.id === itemId)
    if (item) item.completed = !item.completed
  }

  function getNextMaintenance(equipmentId) {
    const equipmentStore = useEquipmentStore()
    const equipment = equipmentStore.getDetail(equipmentId)
    if (!equipment) return null

    const hours = equipment.operatingHours
    const thresholds = Object.entries(MAINTENANCE_SCHEDULE)
      .filter(([, v]) => v.hours !== null)
      .map(([key, v]) => ({ type: key, ...v }))
      .sort((a, b) => a.hours - b.hours)

    // Find next threshold after current hours (modulo full cycle)
    const cycleHours = hours % 20000
    const next = thresholds.find((t) => t.hours > cycleHours)
    if (!next) return { type: 'КР', hoursRemaining: 20000 - cycleHours }
    return { type: next.type, hoursRemaining: next.hours - cycleHours, label: next.label }
  }

  return {
    schedule,
    checklist,
    loading,
    loadSchedule,
    loadChecklist,
    toggleChecklistItem,
    getNextMaintenance,
  }
})
