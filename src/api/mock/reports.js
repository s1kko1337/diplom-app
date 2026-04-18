import { defineCollection, read, patch, append } from './_runtime'
import { createSeed } from './seed/reports.seed'

defineCollection({ name: 'reports', scope: 'global', schemaVersion: 1, seed: createSeed })

function computeNextId() {
  const data = read('reports')
  const max = data.reduce((acc, r) => {
    const n = parseInt(String(r.id).replace(/\D/g, ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return max + 1
}

export function getReports(filters = {}) {
  let data = read('reports')
  if (filters.type) data = data.filter((r) => r.type === filters.type)
  if (filters.equipmentId) data = data.filter((r) => r.equipmentId === filters.equipmentId)
  if (filters.status) data = data.filter((r) => r.status === filters.status)
  if (filters.createdById) data = data.filter((r) => r.createdBy?.id === filters.createdById)
  return data
}

export function getReportById(id) {
  return read('reports').find((r) => r.id === id) || null
}

export function createReport(report) {
  const id = report.id ?? `report-${computeNextId()}`
  const entry = {
    createdAt: new Date().toISOString(),
    status: 'draft',
    publishedAt: null,
    orderId: null,
    alertId: null,
    equipmentId: null,
    ...report,
    id,
  }
  append('reports', entry)
  return entry
}

export function publishReport(id) {
  return patch('reports', id, { status: 'published', publishedAt: new Date().toISOString() })
}

export function updateReport(id, fields) {
  return patch('reports', id, fields)
}
