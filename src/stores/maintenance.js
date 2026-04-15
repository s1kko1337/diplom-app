import { ref } from 'vue'
import { defineStore } from 'pinia'
import { MAINTENANCE_SCHEDULE } from '@/utils/constants'
import * as maintenanceApi from '@/api/maintenance'
import * as journalApi from '@/api/journal'
import { addEntry } from '@/api/audit'
import { useEquipmentStore } from './equipment'
import { useAuthStore } from './auth'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const schedule = ref({})
  const checklist = ref([])
  const loading = ref(false)

  const orders = ref([])
  const currentOrder = ref(null)
  const ordersLoading = ref(false)

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

  async function loadOrders(filters) {
    ordersLoading.value = true
    try {
      orders.value = await maintenanceApi.getOrders(filters)
    } finally {
      ordersLoading.value = false
    }
  }

  async function loadOrder(id) {
    ordersLoading.value = true
    try {
      currentOrder.value = await maintenanceApi.getOrder(id)
    } finally {
      ordersLoading.value = false
    }
  }

  async function createOrder(data) {
    const order = await maintenanceApi.createOrder(data)
    await addEntry({
      action: 'maintenance_order_created',
      details: `Создан наряд ${order.id} (${order.type}) для ${order.equipmentId}`,
      user: data.createdBy?.name || 'Система',
    })
    return order
  }

  function applyOrderUpdate(result) {
    if (!result) return
    if (currentOrder.value && currentOrder.value.id === result.id) {
      currentOrder.value = result
    }
    const idx = orders.value.findIndex((o) => o.id === result.id)
    if (idx !== -1) orders.value[idx] = result
  }

  async function startOrder(id) {
    const equipmentStore = useEquipmentStore()
    const order = orders.value.find((o) => o.id === id) || currentOrder.value
    const equipment = order ? equipmentStore.getDetail(order.equipmentId) : null
    const operatingHours = equipment?.operatingHours || 0
    const result = await maintenanceApi.updateOrderStatus(id, 'in_progress', { operatingHours })
    applyOrderUpdate(result)
    await addEntry({
      action: 'maintenance_order_started',
      details: `Начато выполнение наряда ${id}`,
      user: result.assignedTo?.name || 'Механик',
    })
    return result
  }

  async function startStep(orderId, stepId) {
    const step = await maintenanceApi.startStep(orderId, stepId)
    if (currentOrder.value && currentOrder.value.id === orderId) {
      const idx = currentOrder.value.steps.findIndex((s) => s.id === stepId)
      if (idx !== -1) {
        // Preserve any in-memory edits the user made while the API was in flight.
        const existing = currentOrder.value.steps[idx]
        currentOrder.value.steps[idx] = {
          ...step,
          measurements: existing.measurements?.length
            ? existing.measurements
            : step.measurements || [],
          materials: existing.materials?.length ? existing.materials : step.materials || [],
        }
      }
    }
    return step
  }

  async function completeStep(orderId, stepId, status, comment) {
    const currentStep = currentOrder.value?.steps?.find((s) => s.id === stepId)
    const data = {
      measurements: currentStep?.measurements
        ? currentStep.measurements.map((m) => ({ ...m }))
        : [],
      materials: currentStep?.materials ? currentStep.materials.map((m) => ({ ...m })) : [],
    }
    const step = await maintenanceApi.completeOrderStep(orderId, stepId, status, comment, data)
    if (currentOrder.value && currentOrder.value.id === orderId) {
      const idx = currentOrder.value.steps.findIndex((s) => s.id === stepId)
      if (idx !== -1) {
        currentOrder.value.steps[idx] = {
          ...step,
          measurements: step.measurements || [],
          materials: step.materials || [],
        }
      }
    }
    return step
  }

  async function submitForReview(id) {
    const result = await maintenanceApi.updateOrderStatus(id, 'review')
    applyOrderUpdate(result)
    await addEntry({
      action: 'maintenance_order_submitted',
      details: `Наряд ${id} отправлен на приёмку`,
      user: result.assignedTo?.name || 'Механик',
    })
    return result
  }

  async function approveOrder(id) {
    const authStore = useAuthStore()
    const reviewedBy = {
      id: authStore.userId,
      name: authStore.userName,
    }
    const result = await maintenanceApi.updateOrderStatus(id, 'completed', { reviewedBy })
    result.acceptedBy = { name: authStore.userName, position: 'Мастер' }
    applyOrderUpdate(result)
    const order = orders.value.find((o) => o.id === id) || currentOrder.value
    await journalApi.createEntry({
      equipmentId: order?.equipmentId || result.equipmentId,
      description: `Проведено ${result.type} (наряд ${id}). Все работы выполнены.`,
      clearance: 'Допущен к эксплуатации',
      authorName: authStore.userName,
      orderId: id,
    })
    await addEntry({
      action: 'maintenance_order_approved',
      details: `Наряд ${id} утверждён`,
      user: reviewedBy.name,
    })
    return result
  }

  async function returnOrder(id, reason) {
    const result = await maintenanceApi.updateOrderStatus(id, 'in_progress', {
      returnReason: reason,
    })
    applyOrderUpdate(result)
    await addEntry({
      action: 'maintenance_order_returned',
      details: `Наряд ${id} возвращён: ${reason}`,
      user: result.reviewedBy?.name || 'Мастер',
    })
    return result
  }

  async function cancelOrder(id) {
    const result = await maintenanceApi.updateOrderStatus(id, 'cancelled')
    applyOrderUpdate(result)
    await addEntry({
      action: 'maintenance_order_cancelled',
      details: `Наряд ${id} отменён`,
      user: 'Инженер',
    })
    return result
  }

  function getProgress(order) {
    const steps = order.steps || []
    return {
      total: steps.length,
      passed: steps.filter((s) => s.status === 'passed').length,
      failed: steps.filter((s) => s.status === 'failed').length,
      skipped: steps.filter((s) => s.status === 'skipped').length,
      pending: steps.filter((s) => s.status === 'pending').length,
      in_progress: steps.filter((s) => s.status === 'in_progress').length,
    }
  }

  return {
    schedule,
    checklist,
    loading,
    loadSchedule,
    loadChecklist,
    toggleChecklistItem,
    getNextMaintenance,
    orders,
    currentOrder,
    ordersLoading,
    loadOrders,
    loadOrder,
    createOrder,
    startOrder,
    startStep,
    completeStep,
    submitForReview,
    approveOrder,
    returnOrder,
    cancelOrder,
    getProgress,
  }
})
