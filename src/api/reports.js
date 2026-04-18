import { request } from './client'
import * as mock from './mock/reports'

export function getReports(filters) {
  return request(() => mock.getReports(filters))
}

export function getReportById(id) {
  return request(() => mock.getReportById(id))
}

export function createReport(report) {
  return request(() => mock.createReport(report))
}

export function publishReport(id) {
  return request(() => mock.publishReport(id))
}

export function updateReport(id, fields) {
  return request(() => mock.updateReport(id, fields))
}
