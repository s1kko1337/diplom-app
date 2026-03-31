import { request } from './client'
import * as mock from './mock/audit'

export function getLog(params) {
  return request(() => mock.getAuditLog(params))
}

export function addEntry(entry) {
  return request(() => mock.addAuditEntry(entry))
}
