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

// Регламентированные смазочные и эксплуатационные материалы.
// Источник: «Регламент технического обслуживания и ремонта бурового станка
// СБШ-250МНА-32» (ООО «ГМК-Рудгормаш», Воронеж, 2025) — таблицы 1, 2, 13.1–13.3
// и ведомости расхода материалов на ТО.
export const MATERIAL_CATEGORY_LABELS = {
  grease: 'Пластичные смазки',
  transmission_oil: 'Трансмиссионные масла',
  hydraulic_oil: 'Гидравлические масла',
  filter: 'Фильтроэлементы',
}

export const REGULATED_MATERIALS = {
  // Пластичные смазки (шприцевание подшипников, шлицев, резьб, канатов)
  grease: [
    'Циатим 221 ГОСТ 9433-80',
    'Литол 24-МЛи-4/12-3 ГОСТ 21150-2017',
    'Торсиол-55 ГОСТ 20458-89',
    'Смазка графитная ГОСТ 3333-80',
  ],
  // Трансмиссионные масла (редукторы хода и вращателя)
  transmission_oil: [
    'ТСп-10 ГОСТ 23652-79',
    'Тап-15В ГОСТ 23652-79',
    'Масло К-17 ГОСТ 10877-76',
  ],
  // Гидравлические масла (таблица 2 регламента)
  hydraulic_oil: [
    'МГЕ-46В ТУ 38.001347',
    'И-Г-С-32 ГОСТ 17479.4-87',
    'И-30А ГОСТ 20799-88',
    'ВМГЗ ТУ 38.101479-2000',
    'МГ-22-А ТУ 38.1011232',
    'МГ-22-Б ТУ 38.1011258',
  ],
  // Фильтроэлементы гидросистемы
  filter: [
    'Фильтроэлемент Реготмас 630-1-06',
    'Фильтроэлемент Реготмас 631-1-06',
    'Фильтроэлемент Инпроком-430',
    'Фильтроэлемент Инпроком-430 (10 мкм)',
  ],
}

// Полный перечень наименований материалов для подсказок при создании чек-листа.
export const REGULATED_MATERIAL_NAMES = Object.values(REGULATED_MATERIALS).flat()

// Определяет категорию материала по его наименованию (для фильтрации
// выпадающего списка марок). Явная категория в объекте материала имеет приоритет.
export function inferMaterialCategory(name = '') {
  const n = String(name).toLowerCase()
  if (n.includes('фильтр')) return 'filter'
  if (n.includes('гидравл')) return 'hydraulic_oil'
  if (n.includes('трансмисс') || n.includes('редуктор') || n.includes('вращател'))
    return 'transmission_oil'
  return 'grease'
}

// Возвращает варианты марок для конкретного материала, сгруппированные по категории.
// Если категория известна — только её группа; иначе все группы.
// Текущее (нерегламентное) значение марки добавляется отдельной группой,
// чтобы оно не терялось в выпадающем списке.
export function getMaterialBrandGroups(material) {
  const category = material?.category || inferMaterialCategory(material?.name)
  const known = REGULATED_MATERIALS[category]
  const groups = known
    ? [{ key: category, label: MATERIAL_CATEGORY_LABELS[category], items: known }]
    : Object.entries(REGULATED_MATERIALS).map(([key, items]) => ({
        key,
        label: MATERIAL_CATEGORY_LABELS[key],
        items,
      }))

  const brand = material?.brand
  if (brand && !groups.some((g) => g.items.includes(brand))) {
    return [{ key: 'current', label: 'Текущее значение', items: [brand] }, ...groups]
  }
  return groups
}

// Сгруппированный список наименований материалов для выпадающего списка при
// создании чек-листа. Текущее (произвольное) наименование сохраняется отдельной
// группой, чтобы не потеряться.
export function getMaterialNameGroups(name) {
  const groups = Object.entries(REGULATED_MATERIALS).map(([key, items]) => ({
    key,
    label: MATERIAL_CATEGORY_LABELS[key],
    items,
  }))
  if (name && !REGULATED_MATERIAL_NAMES.includes(name)) {
    return [{ key: 'current', label: 'Текущее значение', items: [name] }, ...groups]
  }
  return groups
}

export const DOCUMENT_TYPES = {
  eo_checklist: 'Чек-лист ЕО',
  act_to1: 'Акт ТО-1',
  act_to2: 'Акт ТО-2',
  act_to3: 'Акт ТО-3',
}
