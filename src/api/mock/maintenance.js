const CHECKLISTS = {
  ЕО: [
    {
      id: 'eo-01',
      description: 'Записать в журнал техническое состояние станка',
      requirement: 'Ежесменно перед началом работы',
      tools: 'Журнал технического состояния',
      completed: false,
    },
    {
      id: 'eo-02',
      description: 'Проверить наличие и исправность инструмента и приспособлений',
      requirement: 'Визуальный осмотр',
      tools: 'Набор ключей, отвёртки',
      completed: false,
    },
    {
      id: 'eo-03',
      description: 'Проверить отсутствие течи масла в соединениях гидросистемы',
      requirement: 'Визуальный осмотр всех соединений',
      tools: 'Ветошь, фонарь',
      completed: false,
    },
    {
      id: 'eo-04',
      description: 'Проверить исправность контрольно-измерительных приборов',
      requirement: 'Проверка показаний и работоспособности',
      tools: 'Тестер, манометр контрольный',
      completed: false,
    },
    {
      id: 'eo-05',
      description: 'Проверить уровень масла в баке гидросистемы',
      requirement: 'Уровень между метками MIN и MAX',
      tools: 'Маслоуказатель',
      completed: false,
    },
    {
      id: 'eo-06',
      description: 'Проверить состояние изоляции кабелей',
      requirement: 'Отсутствие повреждений, оплавлений, трещин',
      tools: 'Мегаомметр, фонарь',
      completed: false,
    },
    {
      id: 'eo-07',
      description: 'Проверить заземление станка',
      requirement: 'Сопротивление не более 4 Ом',
      tools: 'Омметр',
      completed: false,
    },
    {
      id: 'eo-08',
      description: 'Проверить исправность тормозов лебёдки и вращателя',
      requirement: 'Надёжная фиксация, отсутствие проскальзывания',
      tools: 'Визуальный осмотр, ключи',
      completed: false,
    },
  ],
  'ТО-1': [
    {
      id: 'to1-01',
      description: 'Проверить крепления трубопроводов и рукавов гидросистемы',
      requirement: 'Затяжка соединений, отсутствие подтёков',
      tools: 'Набор ключей, динамометрический ключ',
      completed: false,
    },
    {
      id: 'to1-02',
      description: 'Проверить крепление опоры мачты и пальцев',
      requirement: 'Затяжка болтов по регламенту',
      tools: 'Ключи рожковые, динамометрический ключ',
      completed: false,
    },
    {
      id: 'to1-03',
      description: 'Проверить натяжение гусеничных лент',
      requirement: 'Провисание 30-50 мм',
      tools: 'Линейка, ключи для натяжителя',
      completed: false,
    },
    {
      id: 'to1-04',
      description: 'Смазать узлы согласно карте смазки',
      requirement: 'По карте смазки ТО-1',
      tools: 'Шприц-маслёнка, смазка ЦИАТИМ-201',
      completed: false,
    },
    {
      id: 'to1-05',
      description: 'Проверить уровень масла в редукторах',
      requirement: 'Уровень по контрольной пробке',
      tools: 'Ключ для пробок, маслоуказатель',
      completed: false,
    },
    {
      id: 'to1-06',
      description: 'Проверить состояние электроаппаратуры',
      requirement: 'Исправность контакторов, реле, автоматов',
      tools: 'Тестер, отвёртка индикаторная',
      completed: false,
    },
    {
      id: 'to1-07',
      description: 'Проверить и отрегулировать тормоза',
      requirement: 'Тормозной момент по паспорту',
      tools: 'Динамометрический ключ, набор щупов',
      completed: false,
    },
    {
      id: 'to1-08',
      description: 'Проверить состояние канатов',
      requirement: 'Износ не более 10%, отсутствие обрывов проволок',
      tools: 'Штангенциркуль, лупа',
      completed: false,
    },
    {
      id: 'to1-09',
      description: 'Проверить крепления проводов и кабелей',
      requirement: 'Надёжная фиксация, отсутствие перетираний',
      tools: 'Отвёртка, стяжки кабельные',
      completed: false,
    },
  ],
  'ТО-2': [
    {
      id: 'to2-01',
      description: 'Проверить металлоконструкции мачты и рамы',
      requirement: 'Отсутствие трещин, деформаций, коррозии',
      tools: 'Лупа, мел, фонарь, дефектоскоп',
      completed: false,
    },
    {
      id: 'to2-02',
      description: 'Проверить контур заземления и молниезащиту',
      requirement: 'Сопротивление заземления не более 4 Ом',
      tools: 'Мегаомметр, омметр',
      completed: false,
    },
    {
      id: 'to2-03',
      description: 'Очистить электрошкафы и проверить аппаратуру',
      requirement: 'Продувка, протяжка контактов',
      tools: 'Компрессор, отвёртка, тестер',
      completed: false,
    },
    {
      id: 'to2-04',
      description: 'Проверить сопротивление изоляции электродвигателей',
      requirement: 'Не менее 0.5 МОм',
      tools: 'Мегаомметр 500В',
      completed: false,
    },
    {
      id: 'to2-05',
      description: 'Очистить радиаторы системы охлаждения',
      requirement: 'Продувка сжатым воздухом, промывка',
      tools: 'Компрессор, моечная установка',
      completed: false,
    },
    {
      id: 'to2-06',
      description: 'Заменить фильтры гидросистемы',
      requirement: 'Установка новых фильтроэлементов',
      tools: 'Ключи, новые фильтроэлементы',
      completed: false,
    },
    {
      id: 'to2-07',
      description: 'Смазать все узлы согласно карте смазки ТО-2',
      requirement: 'По карте смазки ТО-2',
      tools: 'Шприц-маслёнка, смазка ЦИАТИМ-201, Литол-24',
      completed: false,
    },
  ],
  'ТО-3': [
    {
      id: 'to3-01',
      description: 'Заменить масло в редукторах хода',
      requirement: 'Промывка, заливка нового масла ТАД-17и',
      tools: 'Ёмкость для слива, воронка, масло ТАД-17и',
      completed: false,
    },
    {
      id: 'to3-02',
      description: 'Заменить масло в редукторе вращателя',
      requirement: 'Промывка, заливка нового масла',
      tools: 'Ёмкость для слива, воронка, масло ИГП-72',
      completed: false,
    },
    {
      id: 'to3-03',
      description: 'Заменить масло в гидросистеме',
      requirement: 'Полная замена гидромасла, промывка бака',
      tools: 'Ёмкость для слива, фильтр заливной, масло МГЕ-46В',
      completed: false,
    },
    {
      id: 'to3-04',
      description: 'Смазать все узлы согласно карте смазки ТО-3',
      requirement: 'Полная смазка всех точек',
      tools: 'Шприц-маслёнка, смазка ЦИАТИМ-201, Литол-24, графитная',
      completed: false,
    },
  ],
}

const scheduleDb = {
  'БУР-12': [
    { type: 'ТО-1', scheduledDate: '2026-04-01', scheduledHours: 4900, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-06-15', scheduledHours: 5400, status: 'planned' },
    { type: 'ТО-1', scheduledDate: '2026-08-01', scheduledHours: 5650, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-12-01', scheduledHours: 6000, status: 'planned' },
  ],
  'БУР-08': [
    { type: 'ТО-1', scheduledDate: '2026-03-25', scheduledHours: 12500, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-05-10', scheduledHours: 13000, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-09-01', scheduledHours: 14000, status: 'planned' },
  ],
  'БУР-15': [
    { type: 'ТО-1', scheduledDate: '2026-04-10', scheduledHours: 1450, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-07-01', scheduledHours: 2000, status: 'planned' },
  ],
  'БУР-03': [
    { type: 'ТО-1', scheduledDate: '2026-03-30', scheduledHours: 9150, status: 'overdue' },
    { type: 'ТО-2', scheduledDate: '2026-05-15', scheduledHours: 9500, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-10-01', scheduledHours: 10000, status: 'planned' },
  ],
  'БУР-21': [
    { type: 'ТО-1', scheduledDate: '2026-04-05', scheduledHours: 570, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-06-20', scheduledHours: 1000, status: 'planned' },
  ],
  'БУР-17': [
    { type: 'ТО-1', scheduledDate: '2026-04-15', scheduledHours: 6950, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-06-01', scheduledHours: 7500, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-10-15', scheduledHours: 8000, status: 'planned' },
  ],
  'БУР-05': [
    { type: 'ТО-2', scheduledDate: '2026-05-01', scheduledHours: 2500, status: 'planned' },
  ],
  'БУР-19': [
    { type: 'ТО-1', scheduledDate: '2026-03-28', scheduledHours: 15850, status: 'planned' },
    { type: 'ТО-2', scheduledDate: '2026-05-20', scheduledHours: 16000, status: 'planned' },
    { type: 'ТО-3', scheduledDate: '2026-11-01', scheduledHours: 18000, status: 'planned' },
  ],
}

// Deep clone checklist so each equipment gets independent completed state
function cloneChecklist(items) {
  return items.map((item) => ({ ...item, completed: false }))
}

// Track completed items per equipment
const completedItems = {}

export function getSchedule(equipmentId) {
  return scheduleDb[equipmentId] || []
}

export function getChecklist(equipmentId, type) {
  const template = CHECKLISTS[type]
  if (!template) return []

  const key = `${equipmentId}:${type}`
  if (!completedItems[key]) {
    completedItems[key] = new Set()
  }

  return cloneChecklist(template).map((item) => ({
    ...item,
    completed: completedItems[key].has(item.id),
  }))
}

export function completeChecklistItem(equipmentId, itemId) {
  // Find which checklist type this item belongs to
  for (const [type, items] of Object.entries(CHECKLISTS)) {
    const found = items.find((i) => i.id === itemId)
    if (found) {
      const key = `${equipmentId}:${type}`
      if (!completedItems[key]) {
        completedItems[key] = new Set()
      }
      if (completedItems[key].has(itemId)) {
        completedItems[key].delete(itemId)
      } else {
        completedItems[key].add(itemId)
      }
      return true
    }
  }
  return false
}
