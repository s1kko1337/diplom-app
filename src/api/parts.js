import { request } from './client'
import { getReplacements as mockGetReplacements } from './mock/parts'

export function getReplacements(equipmentId) {
  return request(() => mockGetReplacements(equipmentId))
}
