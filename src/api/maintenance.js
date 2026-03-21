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
