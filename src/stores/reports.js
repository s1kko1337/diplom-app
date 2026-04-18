import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/reports'

export const useReportsStore = defineStore('reports', () => {
  const reports = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentReport = ref(null)

  async function fetchAll(filters) {
    loading.value = true
    error.value = null
    try {
      reports.value = await api.getReports(filters)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    loading.value = true
    try {
      currentReport.value = await api.getReportById(id)
    } finally {
      loading.value = false
    }
  }

  async function create(report) {
    const created = await api.createReport(report)
    reports.value = [created, ...reports.value]
    return created
  }

  async function publish(id) {
    const updated = await api.publishReport(id)
    const idx = reports.value.findIndex((r) => r.id === id)
    if (idx !== -1) reports.value[idx] = updated
    if (currentReport.value?.id === id) currentReport.value = updated
    return updated
  }

  async function update(id, fields) {
    const updated = await api.updateReport(id, fields)
    const idx = reports.value.findIndex((r) => r.id === id)
    if (idx !== -1) reports.value[idx] = updated
    if (currentReport.value?.id === id) currentReport.value = updated
    return updated
  }

  const drafts = computed(() => reports.value.filter((r) => r.status === 'draft'))
  const published = computed(() => reports.value.filter((r) => r.status === 'published'))

  return {
    reports,
    currentReport,
    loading,
    error,
    drafts,
    published,
    fetchAll,
    fetchById,
    create,
    publish,
    update,
  }
})
