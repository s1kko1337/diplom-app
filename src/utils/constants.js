export const STATUS_LABELS = {
  working: 'Работа',
  idle: 'Простой',
  malfunction: 'Авария',
  offline: 'Отключён',
}

export const STATUS_COLORS = {
  working: 'text-status-success',
  idle: 'text-status-warning',
  malfunction: 'text-status-critical',
  offline: 'text-muted-foreground',
}

export const STATUS_DOT_COLORS = {
  working: 'bg-status-success',
  idle: 'bg-status-warning',
  malfunction: 'bg-status-critical',
  offline: 'bg-muted-foreground',
}

// Состояние датчика/показателя (норма / внимание / критично).
// Единый визуальный язык с STATUS_* — цветной маркер + цветная подпись.
export const INDICATOR_STATUS_LABELS = {
  normal: 'Норма',
  warning: 'Внимание',
  critical: 'Критично',
}

export const INDICATOR_STATUS_COLORS = {
  normal: 'text-status-success',
  warning: 'text-status-warning',
  critical: 'text-status-critical',
}

export const INDICATOR_STATUS_DOT_COLORS = {
  normal: 'bg-status-success',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
}

export const INDICATOR_STATUS_BAR_COLORS = {
  normal: 'bg-status-success',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
}

export const MAINTENANCE_SCHEDULE = {
  ЕО: { hours: null, label: 'Ежесменное', workers: 1, duration: 1, laborCost: 1 },
  'ТО-1': { hours: 250, label: 'ТО-1', workers: 2, duration: 4, laborCost: 8 },
  'ТО-2': { hours: 500, label: 'ТО-2', workers: 2, duration: 6, laborCost: 12 },
  'ТО-3': { hours: 2000, label: 'ТО-3', workers: 2, duration: 8, laborCost: 16 },
  'ТР-1': { hours: 2500, label: 'Текущий ремонт 1', workers: 3, duration: null, laborCost: 32 },
  'ТР-2': { hours: 5000, label: 'Текущий ремонт 2', workers: 4, duration: null, laborCost: 292 },
  'ТР-3': { hours: 10000, label: 'Текущий ремонт 3', workers: 4, duration: null, laborCost: 288 },
  КР: { hours: 20000, label: 'Капитальный ремонт', workers: null, duration: null, laborCost: null },
}

export const SUBSYSTEMS = [
  { id: 'hydraulic', label: 'Гидравлика' },
  { id: 'electrical', label: 'Электрика' },
  { id: 'mechanical', label: 'Трансмиссия' },
  { id: 'compressor', label: 'Компрессор' },
]

export const ORDER_STATUSES = {
  planned: 'planned',
  in_progress: 'in_progress',
  review: 'review',
  completed: 'completed',
  cancelled: 'cancelled',
}

export const ORDER_STATUS_LABELS = {
  planned: 'Запланировано',
  in_progress: 'В работе',
  review: 'На приёмке',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

export const ORDER_STATUS_COLORS = {
  planned: 'bg-status-info',
  in_progress: 'bg-status-warning',
  review: 'bg-status-maintenance',
  completed: 'bg-status-success',
  cancelled: 'bg-muted-foreground',
}

export const STEP_STATUSES = {
  pending: 'pending',
  in_progress: 'in_progress',
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
}

export const STEP_STATUS_LABELS = {
  pending: 'Ожидает',
  in_progress: 'Выполняется',
  passed: 'Выполнено',
  failed: 'Не выполнено',
  skipped: 'Пропущено',
}

export const ROLE_LABELS = {
  engineer: 'Инженер',
  mechanic: 'Механик',
  foreman: 'Мастер',
}

export const MEASUREMENT_UNITS = ['мм', '%', 'Ом', 'МОм', 'В', 'А', 'кг', 'л', '°C', 'мм²', 'бар']

export const DOCUMENT_TYPES = {
  eo_checklist: 'Чек-лист ЕО',
  act_to1: 'Акт ТО-1',
  act_to2: 'Акт ТО-2',
  act_to3: 'Акт ТО-3',
}
