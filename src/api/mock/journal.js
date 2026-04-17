import { defineCollection, read, prepend } from './_runtime'
import { createSeed } from './seed/journal.seed'

defineCollection({ name: 'journal', scope: 'global', schemaVersion: 1, seed: createSeed })

function computeNextId() {
  const data = read('journal')
  const max = data.reduce((acc, e) => {
    const n = parseInt(String(e.id).replace(/\D/g, ''), 10)
    return Number.isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return max + 1
}

export function getEntries(filters = {}) {
  let result = [...read('journal')]
  if (filters.equipmentId) {
    result = result.filter((e) => e.equipmentId === filters.equipmentId)
  }
  if (filters.dateFrom) {
    result = result.filter((e) => e.date >= filters.dateFrom)
  }
  if (filters.dateTo) {
    result = result.filter((e) => e.date <= filters.dateTo)
  }
  return result.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return b.time.localeCompare(a.time)
  })
}

export function createEntry(data) {
  const now = new Date()
  const entry = {
    id: `journal-${computeNextId()}`,
    equipmentId: data.equipmentId,
    date: data.date || now.toISOString().slice(0, 10),
    time:
      data.time ||
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    description: data.description,
    clearance: data.clearance || 'Допущен к эксплуатации',
    authorName: data.authorName || 'Система',
    orderId: data.orderId || null,
  }
  prepend('journal', entry)
  return { ...entry }
}
