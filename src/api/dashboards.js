import { request } from './client'
import {
  getDashboardConfig as mockGet,
  saveDashboardConfig as mockSave,
  resetDashboardConfig as mockReset,
} from './mock/dashboards'

export function getConfig(equipmentId) {
  return request(() => mockGet(equipmentId))
}

export function saveConfig(equipmentId, config) {
  return request(() => mockSave(equipmentId, config))
}

export function resetConfig(equipmentId) {
  return request(() => mockReset(equipmentId))
}
