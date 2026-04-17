import { defineCollection, read, patch, prepend } from './_runtime'
import { createSeed } from './seed/alerts.seed'

defineCollection({ name: 'alerts', scope: 'global', schemaVersion: 1, seed: createSeed })

function computeNextId() {
  const data = read('alerts')
  const max = data.reduce((acc, a) => {
    const n = parseInt(String(a.id).replace(/\D/g, ''), 10)
    return Number.isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return max + 1
}

export function getAlerts(equipmentId) {
  const data = read('alerts')
  return equipmentId ? data.filter((a) => a.equipmentId === equipmentId) : [...data]
}

export function acknowledgeAlert(id) {
  const updated = patch('alerts', id, { acknowledged: true })
  return updated !== null
}

export function addAlert(alert) {
  const newAlert = {
    ...alert,
    id: `A-${String(computeNextId()).padStart(3, '0')}`,
    timestamp: new Date().toLocaleString('ru-RU'),
    acknowledged: false,
  }
  prepend('alerts', newAlert)
  return newAlert
}
