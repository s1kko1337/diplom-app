import { request } from './client'
import { getAlerts as mockGetAlerts, acknowledgeAlert as mockAcknowledge } from './mock/alerts'

export function getAlerts(equipmentId) {
  return request(() => mockGetAlerts(equipmentId))
}

export function acknowledge(id) {
  return request(() => mockAcknowledge(id))
}
