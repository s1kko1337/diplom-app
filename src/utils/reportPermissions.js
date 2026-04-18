const CREATE_PERMISSIONS = {
  incident_report: ['engineer', 'mechanic', 'foreman'],
  shift_report: ['engineer', 'foreman'],
  analytics_summary: ['engineer', 'foreman'],
}

export const MANUAL_REPORT_TYPES = Object.keys(CREATE_PERMISSIONS)

export const REPORT_TYPE_LABELS = {
  maintenance_completion: 'Акт выполнения ТО',
  incident_report: 'Отчёт об инциденте',
  shift_report: 'Отчёт смены',
  analytics_summary: 'Аналитическая сводка',
}

export const REPORT_TYPE_DESCRIPTIONS = {
  incident_report: 'Регистрация инцидента с оборудованием: причина, действия, простой.',
  shift_report: 'Итоги смены: состояние парка, выполненные работы, замечания.',
  analytics_summary: 'Сводная аналитика по периоду: загрузка, инциденты, тренды.',
}

export function canCreateReport(role, type) {
  return CREATE_PERMISSIONS[type]?.includes(role) ?? false
}

export function canCreateAnyReport(role) {
  return allowedCreateTypes(role).length > 0
}

export function canEditReport(role, report) {
  if (!report) return false
  if (report.status !== 'draft') return false
  return canCreateReport(role, report.type)
}

export function allowedCreateTypes(role) {
  return MANUAL_REPORT_TYPES.filter((t) => CREATE_PERMISSIONS[t].includes(role))
}
