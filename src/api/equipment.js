import { request } from './client'
import {
  getEquipmentList as mockGetList,
  getEquipmentById as mockGetById,
  getEquipmentSensors as mockGetSensors,
  getLiveSensorData as mockGetLive,
} from './mock/equipment'

export function getList() {
  return request(() => mockGetList())
}

export function getById(id) {
  return request(() => {
    const eq = mockGetById(id)
    if (!eq) throw new Error(`Оборудование ${id} не найдено`)
    return eq
  })
}

export function getSensors(id) {
  return request(() => mockGetSensors(id))
}

export function getLiveData(id) {
  return request(() => mockGetLive(id), { delay: 50 })
}
