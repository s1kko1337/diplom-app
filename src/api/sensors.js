import { request } from './client'
import { getSensorHistory as mockGetHistory } from './mock/history'

export function getHistory(equipmentId, sensorId, { from, to, interval = 5 } = {}) {
  return request(() => mockGetHistory(equipmentId, sensorId, from, to, interval))
}
