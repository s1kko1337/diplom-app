import { defineCollection, read, write, prepend } from './_runtime'
import { createSeed as ordersSeed } from './seed/orders.seed'
import { createSeed as checklistsSeed } from './seed/checklists.seed'

defineCollection({ name: 'orders', scope: 'global', schemaVersion: 1, seed: ordersSeed })
defineCollection({ name: 'checklists', scope: 'global', schemaVersion: 1, seed: checklistsSeed })

const scheduleDb = {
  'БУР-12': [
    { type: 'ТО-1', scheduledDate: '2026-04-01', scheduledHours: 4900, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-06-15', scheduledHours: 5400, status: 'planned' },
    { type: 'ТО-1', scheduledDate: '2026-08-01', scheduledHours: 5650, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-12-01', scheduledHours: 6000, status: 'planned' },
  ],
  'БУР-08': [
    { type: 'ТО-1', scheduledDate: '2026-03-25', scheduledHours: 12500, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-05-10', scheduledHours: 13000, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-09-01', scheduledHours: 14000, status: 'planned' },
  ],
  'БУР-15': [
    { type: 'ТО-1', scheduledDate: '2026-04-10', scheduledHours: 1450, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-07-01', scheduledHours: 2000, status: 'planned' },
  ],
  'БУР-03': [
    { type: 'ТО-1', scheduledDate: '2026-03-30', scheduledHours: 9150, status: 'overdue' },
    { type: 'ТО-2', scheduledDate: '2026-05-15', scheduledHours: 9500, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-10-01', scheduledHours: 10000, status: 'planned' },
  ],
  'БУР-21': [
    { type: 'ТО-1', scheduledDate: '2026-04-05', scheduledHours: 570, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-06-20', scheduledHours: 1000, status: 'planned' },
  ],
  'БУР-17': [
    { type: 'ТО-1', scheduledDate: '2026-04-15', scheduledHours: 6950, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-06-01', scheduledHours: 7500, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-10-15', scheduledHours: 8000, status: 'planned' },
  ],
  'БУР-05': [
    { type: 'ТО-2', scheduledDate: '2026-05-01', scheduledHours: 2500, status: 'planned' },
  ],
  'БУР-19': [
    { type: 'ТО-1', scheduledDate: '2026-03-28', scheduledHours: 15850, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-05-20', scheduledHours: 16000, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-11-01', scheduledHours: 18000, status: 'planned' },
  ],
}

function cloneChecklist(items) {
  return items.map((item) => ({
    ...item,
    completed: false,
    measurements: item.measurements ? item.measurements.map((m) => ({ ...m })) : [],
    materials: item.materials ? item.materials.map((m) => ({ ...m })) : [],
  }))
}

function deepCloneStep(s) {
  return {
    ...s,
    measurements: s.measurements ? s.measurements.map((m) => ({ ...m })) : [],
    materials: s.materials ? s.materials.map((m) => ({ ...m })) : [],
  }
}

function deepCloneOrder(order) {
  return { ...order, steps: order.steps.map(deepCloneStep) }
}

const completedItems = {}

export function getSchedule(equipmentId) {
  return scheduleDb[equipmentId] || []
}

export function getChecklist(equipmentId, type) {
  const checklists = read('checklists')
  const template = checklists[type]
  if (!template) return []

  const key = `${equipmentId}:${type}`
  if (!completedItems[key]) {
    completedItems[key] = new Set()
  }

  return cloneChecklist(template).map((item) => ({
    ...item,
    completed: completedItems[key].has(item.id),
  }))
}

export function completeChecklistItem(equipmentId, itemId) {
  const checklists = read('checklists')
  for (const [type, items] of Object.entries(checklists)) {
    const found = items.find((i) => i.id === itemId)
    if (found) {
      const key = `${equipmentId}:${type}`
      if (!completedItems[key]) {
        completedItems[key] = new Set()
      }
      if (completedItems[key].has(itemId)) {
        completedItems[key].delete(itemId)
      } else {
        completedItems[key].add(itemId)
      }
      return true
    }
  }
  return false
}

export function getOrders(filters = {}) {
  let result = [...read('orders')]
  if (filters.equipmentId) {
    result = result.filter((o) => o.equipmentId === filters.equipmentId)
  }
  if (filters.type) {
    result = result.filter((o) => o.type === filters.type)
  }
  if (filters.assignedTo) {
    result = result.filter((o) => o.assignedTo?.id === filters.assignedTo)
  }
  if (filters.status) {
    result = result.filter((o) => o.status === filters.status)
  }
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(deepCloneOrder)
}

export function getOrder(id) {
  const order = read('orders').find((o) => o.id === id)
  if (!order) throw new Error('Наряд не найден')
  return deepCloneOrder(order)
}

export function createOrder(data) {
  const checklists = read('checklists')
  const template = checklists[data.type] || []
  const newOrder = {
    id: 'ТО-' + Date.now(),
    equipmentId: data.equipmentId,
    type: data.type,
    status: 'planned',
    createdBy: data.createdBy,
    assignedTo: data.assignedTo || null,
    reviewedBy: null,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    reviewedAt: null,
    returnReason: null,
    operatingHoursAtStart: null,
    scheduledDate: data.scheduledDate || null,
    executors: [],
    acceptedBy: null,
    remarks: null,
    steps: (data.steps || template).map((item, i) => ({
      id: `step-${i + 1}`,
      description: item.description,
      requirement: item.requirement || '',
      tools: item.tools || '',
      status: 'pending',
      comment: null,
      startedAt: null,
      completedAt: null,
      measurements: item.measurements || [],
      materials: item.materials || [],
    })),
  }
  prepend('orders', newOrder)
  return deepCloneOrder(newOrder)
}

export function updateOrderStatus(id, status, payload = {}) {
  const orders = read('orders')
  const idx = orders.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error('Наряд не найден')
  const order = { ...orders[idx], steps: orders[idx].steps.map((s) => ({ ...s })) }
  order.status = status
  if (status === 'in_progress' && payload.operatingHours != null) {
    order.startedAt = new Date().toISOString()
    order.operatingHoursAtStart = payload.operatingHours
    order.returnReason = null
  }
  if (status === 'completed' && payload.reviewedBy) {
    order.completedAt = new Date().toISOString()
    order.reviewedAt = new Date().toISOString()
    order.reviewedBy = payload.reviewedBy
  }
  if (status === 'in_progress' && payload.returnReason) {
    order.returnReason = payload.returnReason
  }
  if (status === 'planned') {
    order.startedAt = null
    order.completedAt = null
    order.reviewedAt = null
    order.reviewedBy = null
    order.returnReason = null
    order.operatingHoursAtStart = null
    order.acceptedBy = null
    order.steps = order.steps.map((s) => ({
      ...s,
      status: 'pending',
      comment: null,
      startedAt: null,
      completedAt: null,
    }))
  }
  orders[idx] = order
  write('orders', orders)
  return deepCloneOrder(order)
}

export function completeOrderStep(orderId, stepId, status, comment, data = {}) {
  const orders = read('orders')
  const orderIdx = orders.findIndex((o) => o.id === orderId)
  if (orderIdx === -1) throw new Error('Наряд не найден')
  const order = { ...orders[orderIdx], steps: orders[orderIdx].steps.map((s) => ({ ...s })) }
  const stepIdx = order.steps.findIndex((s) => s.id === stepId)
  if (stepIdx === -1) throw new Error('Шаг не найден')
  const step = { ...order.steps[stepIdx] }
  step.status = status
  step.comment = comment || null
  step.completedAt = new Date().toISOString()
  if (!step.startedAt) {
    step.startedAt = step.completedAt
  }
  if (data.measurements) step.measurements = data.measurements.map((m) => ({ ...m }))
  if (data.materials) step.materials = data.materials.map((m) => ({ ...m }))
  order.steps[stepIdx] = step
  orders[orderIdx] = order
  write('orders', orders)
  return deepCloneStep(step)
}

export function startOrderStep(orderId, stepId) {
  const orders = read('orders')
  const orderIdx = orders.findIndex((o) => o.id === orderId)
  if (orderIdx === -1) throw new Error('Наряд не найден')
  const order = { ...orders[orderIdx], steps: orders[orderIdx].steps.map((s) => ({ ...s })) }
  const stepIdx = order.steps.findIndex((s) => s.id === stepId)
  if (stepIdx === -1) throw new Error('Шаг не найден')
  const step = { ...order.steps[stepIdx] }
  if (step.status === 'in_progress') return deepCloneStep(step)
  step.status = 'in_progress'
  step.startedAt = new Date().toISOString()
  order.steps[stepIdx] = step
  orders[orderIdx] = order
  write('orders', orders)
  return deepCloneStep(step)
}

export function getChecklistTemplate(type) {
  const checklists = read('checklists')
  return cloneChecklist(checklists[type] || [])
}
