import { defineCollection, read, prepend } from './_runtime'
import { createSeed } from './seed/audit.seed'

defineCollection({ name: 'audit', scope: 'global', schemaVersion: 1, seed: createSeed })

export function getAuditLog({ equipmentId, limit = 20 } = {}) {
  let log = [...read('audit')]
  if (equipmentId) log = log.filter((e) => e.equipmentId === equipmentId)
  return log.slice(0, limit)
}

export function addAuditEntry(entry) {
  prepend('audit', {
    ...entry,
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
  })
}
