import { request } from './client'
import * as mock from './mock/maintenance'

export function getSchedule(equipmentId) {
  return request(() => mock.getSchedule(equipmentId))
}

export function getChecklist(equipmentId, type) {
  return request(() => mock.getChecklist(equipmentId, type))
}

export function completeChecklistItem(equipmentId, itemId) {
  return request(() => mock.completeChecklistItem(equipmentId, itemId))
}

export function getOrders(filters) {
  return request(() => mock.getOrders(filters))
}

export function getOrder(id) {
  return request(() => mock.getOrder(id))
}

export function createOrder(data) {
  return request(() => mock.createOrder(data))
}

export function updateOrderStatus(id, status, payload) {
  return request(() => mock.updateOrderStatus(id, status, payload))
}

export function completeOrderStep(orderId, stepId, status, comment) {
  return request(() => mock.completeOrderStep(orderId, stepId, status, comment))
}

export function getChecklistTemplate(type) {
  return request(() => mock.getChecklistTemplate(type))
}
