export const STATUS_LABELS = {
  working: 'Работа',
  idle: 'Простой',
  malfunction: 'Авария',
  offline: 'Отключён',
}

export const STATUS_COLORS = {
  working: 'text-green-500',
  idle: 'text-yellow-500',
  malfunction: 'text-red-500',
  offline: 'text-muted-foreground',
}

export const STATUS_DOT_COLORS = {
  working: 'bg-green-500',
  idle: 'bg-yellow-500',
  malfunction: 'bg-red-500',
  offline: 'bg-zinc-500',
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
  planned: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  review: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-zinc-500',
}

export const STEP_STATUSES = {
  pending: 'pending',
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
}

export const STEP_STATUS_LABELS = {
  pending: 'Ожидает',
  passed: 'Выполнено',
  failed: 'Не выполнено',
  skipped: 'Пропущено',
}

export const ROLE_LABELS = {
  engineer: 'Инженер',
  mechanic: 'Механик',
  foreman: 'Мастер',
}
