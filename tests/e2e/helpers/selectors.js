export const ROLES = {
  engineer: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
  mechanic: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
  mechanic2: { id: 'user-3', name: 'Сидоров К.М.', role: 'mechanic' },
  foreman: { id: 'user-4', name: 'Козлов Д.А.', role: 'foreman' },
}

export const STATUS_LABELS = {
  working: 'Работа',
  idle: 'Простой',
  malfunction: 'Авария',
  offline: 'Отключён',
}

export const ORDER_STATUS_LABELS = {
  planned: 'Запланировано',
  in_progress: 'В работе',
  review: 'На приёмке',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

export const NAV_LINKS = {
  home: 'Главная',
  dashboard: 'Мониторинг',
  equipment: 'Оборудование',
  maintenance: 'Техобслуживание',
  journal: 'Журнал ТС',
  alerts: 'Уведомления',
  analytics: 'Аналитика',
  reports: 'Отчёты',
  settings: 'Настройки',
}

export const TESTIDS = {
  connectionStatus: 'connection-status',
  widgetCard: 'widget-card',
  alertCard: 'alert-card',
  equipmentCard: 'equipment-card',
  criticalModal: 'critical-alert-modal',
}
