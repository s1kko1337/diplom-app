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
      measurements: [
        {
          id: 'meas-brake',
          description: 'Величина отхода тормозных колодок',
          unit: 'мм',
          norm: '1.7 (не более)',
          fact: null,
          passed: null,
        },
      ],
    },
    {
      id: 'to1-08',
      description: 'Проверить состояние канатов',
      requirement: 'Износ не более 10%, отсутствие обрывов проволок',
      tools: 'Штангенциркуль, лупа',
      completed: false,
      measurements: [
        {
          id: 'meas-rope',
          description: 'Износ каната',
          unit: '%',
          norm: '10 (не более)',
          fact: null,
          passed: null,
        },
      ],
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
      measurements: [
        {
          id: 'meas-ground',
          description: 'Сопротивление защитного заземления',
          unit: 'Ом',
          norm: '4 (не более)',
          fact: null,
          passed: null,
        },
      ],
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
      measurements: [
        {
          id: 'meas-insulation',
          description: 'Сопротивление изоляции электродвигателей',
          unit: 'МОм',
          norm: '0.5 (не менее)',
          fact: null,
          passed: null,
        },
      ],
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
      materials: [
        { id: 'mat-grease-1', name: 'Смазка ЦИАТИМ-201', unit: 'кг', volume: null, brand: null },
        { id: 'mat-grease-2', name: 'Смазка Литол-24', unit: 'кг', volume: null, brand: null },
      ],
    },
  ],
  'ТО-3': [
    {
      id: 'to3-01',
      description: 'Заменить масло в редукторах хода',
      requirement: 'Промывка, заливка нового масла ТАД-17и',
      tools: 'Ёмкость для слива, воронка, масло ТАД-17и',
      completed: false,
      materials: [
        {
          id: 'mat-trans-oil',
          name: 'Масло трансмиссионное ТАД-17и',
          unit: 'л',
          volume: null,
          brand: null,
        },
      ],
    },
    {
      id: 'to3-02',
      description: 'Заменить масло в редукторе вращателя',
      requirement: 'Промывка, заливка нового масла',
      tools: 'Ёмкость для слива, воронка, масло ИГП-72',
      completed: false,
      materials: [
        { id: 'mat-rotator-oil', name: 'Масло ИГП-72', unit: 'л', volume: null, brand: null },
      ],
    },
    {
      id: 'to3-03',
      description: 'Заменить масло в гидросистеме',
      requirement: 'Полная замена гидромасла, промывка бака',
      tools: 'Ёмкость для слива, фильтр заливной, масло МГЕ-46В',
      completed: false,
      materials: [
        {
          id: 'mat-hydro-oil',
          name: 'Масло гидравлическое МГЕ-46В',
          unit: 'л',
          volume: null,
          brand: null,
        },
      ],
    },
    {
      id: 'to3-04',
      description: 'Смазать все узлы согласно карте смазки ТО-3',
      requirement: 'Полная смазка всех точек',
      tools: 'Шприц-маслёнка, смазка ЦИАТИМ-201, Литол-24, графитная',
      completed: false,
    },
  ],
  'ТР-1': [
    {
      id: 'tr1-01',
      description: 'Ревизия тормозной системы',
      requirement: 'Разборка, дефектация, замена накладок',
      tools: 'Набор ключей, динамометрический ключ',
      completed: false,
    },
    {
      id: 'tr1-02',
      description: 'Замена подшипников вращателя',
      requirement: 'Замена по регламенту или при обнаружении люфта',
      tools: 'Съёмник, пресс, подшипники',
      completed: false,
    },
    {
      id: 'tr1-03',
      description: 'Проверка гидроцилиндров подачи',
      requirement: 'Проверка хода, герметичности, давления',
      tools: 'Манометр, ключи',
      completed: false,
    },
    {
      id: 'tr1-04',
      description: 'Ревизия пневмосистемы',
      requirement: 'Проверка клапанов, трубопроводов, ресивера',
      tools: 'Компрессор контрольный, ключи',
      completed: false,
    },
    {
      id: 'tr1-05',
      description: 'Проверка сварных швов мачты',
      requirement: 'Визуальный и инструментальный контроль',
      tools: 'Лупа, дефектоскоп, мел',
      completed: false,
    },
    {
      id: 'tr1-06',
      description: 'Замена манжет гидроцилиндров',
      requirement: 'Замена всех уплотнений',
      tools: 'Монтажный инструмент, ремкомплект',
      completed: false,
    },
    {
      id: 'tr1-07',
      description: 'Ревизия электрошкафов',
      requirement: 'Протяжка, замена повреждённых элементов',
      tools: 'Отвёртка, тестер, контакт-клеммы',
      completed: false,
    },
    {
      id: 'tr1-08',
      description: 'Дефектация канатов',
      requirement: 'Полная дефектация с замером износа',
      tools: 'Штангенциркуль, лупа, рулетка',
      completed: false,
    },
  ],
  'ТР-2': [
    {
      id: 'tr2-01',
      description: 'Капремонт редукторов хода',
      requirement: 'Разборка, замена шестерён и подшипников',
      tools: 'Съёмник, пресс, запчасти',
      completed: false,
    },
    {
      id: 'tr2-02',
      description: 'Замена канатов',
      requirement: 'Замена всех несущих канатов',
      tools: 'Лебёдка вспомогательная, канаты',
      completed: false,
    },
    {
      id: 'tr2-03',
      description: 'Полная ревизия электрошкафов',
      requirement: 'Замена автоматов, контакторов, реле',
      tools: 'Тестер, электроинструмент',
      completed: false,
    },
    {
      id: 'tr2-04',
      description: 'Замена гидрошлангов',
      requirement: 'Замена всех РВД',
      tools: 'Ключи, новые РВД',
      completed: false,
    },
    {
      id: 'tr2-05',
      description: 'Ревизия компрессора',
      requirement: 'Проверка клапанов, поршневой группы',
      tools: 'Инструмент специальный, манометр',
      completed: false,
    },
    {
      id: 'tr2-06',
      description: 'Замена футеровки',
      requirement: 'Замена защитных элементов',
      tools: 'Сварочный аппарат, листовая сталь',
      completed: false,
    },
    {
      id: 'tr2-07',
      description: 'Ревизия поворотной платформы',
      requirement: 'Проверка ОПУ, смазка',
      tools: 'Домкраты, смазка, ключи',
      completed: false,
    },
    {
      id: 'tr2-08',
      description: 'Перепрессовка пальцев гусениц',
      requirement: 'Выпрессовка и запрессовка пальцев',
      tools: 'Пресс гидравлический',
      completed: false,
    },
    {
      id: 'tr2-09',
      description: 'Ревизия вращателя',
      requirement: 'Полная разборка и дефектация',
      tools: 'Съёмник, стенд, запчасти',
      completed: false,
    },
    {
      id: 'tr2-10',
      description: 'Проверка рамы',
      requirement: 'Дефектоскопия сварных швов рамы',
      tools: 'Дефектоскоп ультразвуковой',
      completed: false,
    },
  ],
  'ТР-3': [
    {
      id: 'tr3-01',
      description: 'Разборка/сборка ходовой части',
      requirement: 'Полная разборка с дефектацией',
      tools: 'Кран, домкраты, инструмент',
      completed: false,
    },
    {
      id: 'tr3-02',
      description: 'Замена вращателя',
      requirement: 'Демонтаж старого, установка нового',
      tools: 'Кран, ключи, стропы',
      completed: false,
    },
    {
      id: 'tr3-03',
      description: 'Капремонт компрессора',
      requirement: 'Полная разборка, замена поршневой',
      tools: 'Стенд, запчасти, инструмент',
      completed: false,
    },
    {
      id: 'tr3-04',
      description: 'Замена электродвигателей',
      requirement: 'Демонтаж и установка новых двигателей',
      tools: 'Кран, электроинструмент',
      completed: false,
    },
    {
      id: 'tr3-05',
      description: 'Полная дефектация гидросистемы',
      requirement: 'Проверка всех гидрокомпонентов',
      tools: 'Стенд гидравлический, манометры',
      completed: false,
    },
    {
      id: 'tr3-06',
      description: 'Ревизия мачты с заменой секций',
      requirement: 'Замена повреждённых секций',
      tools: 'Кран, сварочный аппарат',
      completed: false,
    },
    {
      id: 'tr3-07',
      description: 'Замена кабельного барабана',
      requirement: 'Демонтаж и установка нового',
      tools: 'Кран, электроинструмент',
      completed: false,
    },
    {
      id: 'tr3-08',
      description: 'Ревизия системы пылеподавления',
      requirement: 'Проверка форсунок, насоса, трубопроводов',
      tools: 'Ключи, манометр',
      completed: false,
    },
    {
      id: 'tr3-09',
      description: 'Замена опорно-поворотного устройства',
      requirement: 'Демонтаж и установка нового ОПУ',
      tools: 'Кран, домкраты, болты',
      completed: false,
    },
    {
      id: 'tr3-10',
      description: 'Капремонт лебёдки',
      requirement: 'Разборка, замена барабана, тормозов',
      tools: 'Стенд, запчасти',
      completed: false,
    },
    {
      id: 'tr3-11',
      description: 'Ревизия системы охлаждения',
      requirement: 'Промывка радиаторов, замена патрубков',
      tools: 'Моечная установка, запчасти',
      completed: false,
    },
    {
      id: 'tr3-12',
      description: 'Восстановление антикоррозийного покрытия',
      requirement: 'Зачистка, грунтовка, покраска',
      tools: 'Пескоструй, краскопульт',
      completed: false,
    },
  ],
  КР: [
    {
      id: 'kr-01',
      description: 'Полная дефектация рамы',
      requirement: 'Ультразвуковая и магнитная дефектоскопия',
      tools: 'Дефектоскоп, стенд',
      completed: false,
    },
    {
      id: 'kr-02',
      description: 'Восстановление/замена мачты',
      requirement: 'Полная замена или восстановление секций',
      tools: 'Кран, сварочный пост',
      completed: false,
    },
    {
      id: 'kr-03',
      description: 'Замена ходовой части',
      requirement: 'Полная замена гусениц, катков, звёздочек',
      tools: 'Кран, пресс, запчасти',
      completed: false,
    },
    {
      id: 'kr-04',
      description: 'Полная замена гидросистемы',
      requirement: 'Замена всех гидрокомпонентов и трубопроводов',
      tools: 'Стенд, трубогиб',
      completed: false,
    },
    {
      id: 'kr-05',
      description: 'Замена всех электродвигателей',
      requirement: 'Установка новых двигателей',
      tools: 'Кран, электроинструмент',
      completed: false,
    },
    {
      id: 'kr-06',
      description: 'Замена компрессора',
      requirement: 'Установка нового компрессора',
      tools: 'Кран, ключи, стропы',
      completed: false,
    },
    {
      id: 'kr-07',
      description: 'Восстановление кабины оператора',
      requirement: 'Ремонт/замена кабины, остекление',
      tools: 'Сварочный пост, стёкла',
      completed: false,
    },
    {
      id: 'kr-08',
      description: 'Полная замена КИП',
      requirement: 'Установка новых приборов и датчиков',
      tools: 'Электроинструмент, тестер',
      completed: false,
    },
    {
      id: 'kr-09',
      description: 'Восстановление системы пылеподавления',
      requirement: 'Полная замена системы',
      tools: 'Сварочный пост, запчасти',
      completed: false,
    },
    {
      id: 'kr-10',
      description: 'Замена поворотной платформы',
      requirement: 'Установка новой платформы',
      tools: 'Кран, домкраты',
      completed: false,
    },
    {
      id: 'kr-11',
      description: 'Установка нового вращателя',
      requirement: 'Монтаж и центровка',
      tools: 'Кран, уровень, ключи',
      completed: false,
    },
    {
      id: 'kr-12',
      description: 'Монтаж новой лебёдки',
      requirement: 'Установка и обкатка',
      tools: 'Кран, стенд обкатки',
      completed: false,
    },
    {
      id: 'kr-13',
      description: 'Полная замена кабельного хозяйства',
      requirement: 'Прокладка новых кабелей и проводов',
      tools: 'Электроинструмент, кабель',
      completed: false,
    },
    {
      id: 'kr-14',
      description: 'Покраска и антикоррозийная обработка',
      requirement: 'Полная покраска станка',
      tools: 'Пескоструй, краскопульт, краска',
      completed: false,
    },
    {
      id: 'kr-15',
      description: 'Комплексные испытания',
      requirement: 'Обкатка всех систем под нагрузкой',
      tools: 'Стенд нагрузочный, приборы',
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

const MOCK_ORDERS = [
  {
    id: 'ТО-001',
    equipmentId: 'БУР-12',
    type: 'ТО-1',
    status: 'planned',
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    assignedTo: { id: 'user-2', name: 'Петров С.В.' },
    reviewedBy: null,
    createdAt: '2026-03-18T09:00:00',
    startedAt: null,
    completedAt: null,
    reviewedAt: null,
    returnReason: null,
    operatingHoursAtStart: null,
    scheduledDate: '2026-04-01',
    executors: [],
    acceptedBy: null,
    remarks: null,
    steps: cloneChecklist(CHECKLISTS['ТО-1']).map((item, i) => ({
      id: `step-${i + 1}`,
      description: item.description,
      requirement: item.requirement,
      tools: item.tools,
      status: 'pending',
      comment: null,
      startedAt: null,
      completedAt: null,
      measurements: item.measurements || [],
      materials: item.materials || [],
    })),
  },
  {
    id: 'ТО-002',
    equipmentId: 'БУР-08',
    type: 'ТО-2',
    status: 'in_progress',
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    assignedTo: { id: 'user-3', name: 'Сидоров К.М.' },
    reviewedBy: null,
    createdAt: '2026-03-15T08:30:00',
    startedAt: '2026-03-16T07:00:00',
    completedAt: null,
    reviewedAt: null,
    returnReason: null,
    operatingHoursAtStart: 12480,
    scheduledDate: '2026-03-20',
    executors: [{ name: 'Сидоров К.М.', position: 'Механик' }],
    acceptedBy: null,
    remarks: null,
    steps: cloneChecklist(CHECKLISTS['ТО-2']).map((item, i) => ({
      id: `step-${i + 1}`,
      description: item.description,
      requirement: item.requirement,
      tools: item.tools,
      status: i < 3 ? 'passed' : i === 3 ? 'failed' : 'pending',
      comment: i === 3 ? 'Обнаружена коррозия контактов' : null,
      startedAt: i < 4 ? `2026-03-16T${String(7 + i).padStart(2, '0')}:00:00` : null,
      completedAt: i < 4 ? `2026-03-16T${String(7 + i).padStart(2, '0')}:45:00` : null,
      measurements: item.measurements || [],
      materials: item.materials || [],
    })),
  },
  {
    id: 'ТО-003',
    equipmentId: 'БУР-15',
    type: 'ЕО',
    status: 'review',
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    assignedTo: { id: 'user-2', name: 'Петров С.В.' },
    reviewedBy: null,
    createdAt: '2026-03-14T08:00:00',
    startedAt: '2026-03-14T08:30:00',
    completedAt: null,
    reviewedAt: null,
    returnReason: null,
    operatingHoursAtStart: 1430,
    scheduledDate: '2026-03-14',
    executors: [{ name: 'Петров С.В.', position: 'Механик' }],
    acceptedBy: null,
    remarks: null,
    steps: cloneChecklist(CHECKLISTS['ЕО']).map((item, i) => ({
      id: `step-${i + 1}`,
      description: item.description,
      requirement: item.requirement,
      tools: item.tools,
      status: i === 5 ? 'skipped' : 'passed',
      comment: i === 5 ? 'Мегаомметр на поверке' : null,
      startedAt: `2026-03-14T${String(8 + Math.floor(i / 3)).padStart(2, '0')}:${String((i % 3) * 20).padStart(2, '0')}:00`,
      completedAt: `2026-03-14T${String(8 + Math.floor((i + 1) / 3)).padStart(2, '0')}:${String(((i + 1) % 3) * 20).padStart(2, '0')}:00`,
      measurements: item.measurements || [],
      materials: item.materials || [],
    })),
  },
  {
    id: 'ТО-004',
    equipmentId: 'БУР-17',
    type: 'ТО-1',
    status: 'completed',
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    assignedTo: { id: 'user-3', name: 'Сидоров К.М.' },
    reviewedBy: { id: 'user-4', name: 'Козлов Д.А.' },
    createdAt: '2026-03-10T09:00:00',
    startedAt: '2026-03-11T07:00:00',
    completedAt: '2026-03-12T16:00:00',
    reviewedAt: '2026-03-12T17:00:00',
    returnReason: null,
    operatingHoursAtStart: 6900,
    scheduledDate: '2026-03-12',
    executors: [
      { name: 'Сидоров К.М.', position: 'Механик' },
      { name: 'Волков И.Р.', position: 'Электрик' },
    ],
    acceptedBy: { name: 'Козлов Д.А.', position: 'Мастер' },
    remarks: 'Рекомендуется замена тормозных колодок при следующем ТО-2',
    steps: cloneChecklist(CHECKLISTS['ТО-1']).map((item, i) => ({
      id: `step-${i + 1}`,
      description: item.description,
      requirement: item.requirement,
      tools: item.tools,
      status: 'passed',
      comment: null,
      startedAt: `2026-03-11T${String(7 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}:00`,
      completedAt: `2026-03-11T${String(7 + Math.floor((i + 1) / 2)).padStart(2, '0')}:${(i + 1) % 2 === 0 ? '00' : '30'}:00`,
      measurements: item.measurements || [],
      materials: item.materials || [],
    })),
  },
  {
    id: 'ТО-005',
    equipmentId: 'БУР-03',
    type: 'ТО-3',
    status: 'cancelled',
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    assignedTo: null,
    reviewedBy: null,
    createdAt: '2026-03-08T09:00:00',
    startedAt: null,
    completedAt: null,
    reviewedAt: null,
    returnReason: null,
    operatingHoursAtStart: null,
    scheduledDate: '2026-03-20',
    executors: [],
    acceptedBy: null,
    remarks: null,
    steps: cloneChecklist(CHECKLISTS['ТО-3']).map((item, i) => ({
      id: `step-${i + 1}`,
      description: item.description,
      requirement: item.requirement,
      tools: item.tools,
      status: 'pending',
      comment: null,
      startedAt: null,
      completedAt: null,
      measurements: item.measurements || [],
      materials: item.materials || [],
    })),
  },
  {
    id: 'ТО-006',
    equipmentId: 'БУР-19',
    type: 'ТР-1',
    status: 'planned',
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    assignedTo: { id: 'user-2', name: 'Петров С.В.' },
    reviewedBy: null,
    createdAt: '2026-03-20T10:00:00',
    startedAt: null,
    completedAt: null,
    reviewedAt: null,
    returnReason: null,
    operatingHoursAtStart: null,
    scheduledDate: '2026-04-05',
    executors: [],
    acceptedBy: null,
    remarks: null,
    steps: cloneChecklist(CHECKLISTS['ТР-1']).map((item, i) => ({
      id: `step-${i + 1}`,
      description: item.description,
      requirement: item.requirement,
      tools: item.tools,
      status: 'pending',
      comment: null,
      startedAt: null,
      completedAt: null,
      measurements: item.measurements || [],
      materials: item.materials || [],
    })),
  },
  // ТО-007: in_progress для Петрова — демо прохождения шагов
  {
    id: 'ТО-007',
    equipmentId: 'БУР-21',
    type: 'ТО-1',
    status: 'in_progress',
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    assignedTo: { id: 'user-2', name: 'Петров С.В.' },
    reviewedBy: null,
    createdAt: '2026-03-21T08:00:00',
    startedAt: '2026-03-22T07:00:00',
    completedAt: null,
    reviewedAt: null,
    returnReason: null,
    operatingHoursAtStart: 540,
    scheduledDate: '2026-03-22',
    executors: [{ name: 'Петров С.В.', position: 'Механик' }],
    acceptedBy: null,
    remarks: null,
    steps: cloneChecklist(CHECKLISTS['ТО-1']).map((item, i) => ({
      id: `step-${i + 1}`,
      description: item.description,
      requirement: item.requirement,
      tools: item.tools,
      status: 'pending',
      comment: null,
      startedAt: null,
      completedAt: null,
      measurements: item.measurements || [],
      materials: item.materials || [],
    })),
  },
]

let orders = MOCK_ORDERS.map((o) => ({ ...o, steps: o.steps.map((s) => ({ ...s })) }))

export function getOrders(filters = {}) {
  let result = [...orders]
  if (filters.equipmentId) {
    result = result.filter((o) => o.equipmentId === filters.equipmentId)
  }
  if (filters.type) {
    result = result.filter((o) => o.type === filters.type)
  }
  if (filters.assignedTo) {
    result = result.filter((o) => o.assignedTo?.id === filters.assignedTo)
  }
  if (filters.status) {
    result = result.filter((o) => o.status === filters.status)
  }
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getOrder(id) {
  const order = orders.find((o) => o.id === id)
  if (!order) throw new Error('Наряд не найден')
  return { ...order, steps: order.steps.map((s) => ({ ...s })) }
}

export function createOrder(data) {
  const template = CHECKLISTS[data.type] || []
  const newOrder = {
    id: 'ТО-' + Date.now(),
    equipmentId: data.equipmentId,
    type: data.type,
    status: 'planned',
    createdBy: data.createdBy,
    assignedTo: data.assignedTo || null,
    reviewedBy: null,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    reviewedAt: null,
    returnReason: null,
    operatingHoursAtStart: null,
    scheduledDate: data.scheduledDate || null,
    executors: [],
    acceptedBy: null,
    remarks: null,
    steps: (data.steps || template).map((item, i) => ({
      id: `step-${i + 1}`,
      description: item.description,
      requirement: item.requirement || '',
      tools: item.tools || '',
      status: 'pending',
      comment: null,
      startedAt: null,
      completedAt: null,
      measurements: item.measurements || [],
      materials: item.materials || [],
    })),
  }
  orders.unshift(newOrder)
  return { ...newOrder, steps: newOrder.steps.map((s) => ({ ...s })) }
}

export function updateOrderStatus(id, status, payload = {}) {
  const order = orders.find((o) => o.id === id)
  if (!order) throw new Error('Наряд не найден')
  order.status = status
  if (status === 'in_progress' && payload.operatingHours != null) {
    order.startedAt = new Date().toISOString()
    order.operatingHoursAtStart = payload.operatingHours
    order.returnReason = null
  }
  if (status === 'completed' && payload.reviewedBy) {
    order.completedAt = new Date().toISOString()
    order.reviewedAt = new Date().toISOString()
    order.reviewedBy = payload.reviewedBy
  }
  if (status === 'in_progress' && payload.returnReason) {
    order.returnReason = payload.returnReason
  }
  return { ...order, steps: order.steps.map((s) => ({ ...s })) }
}

export function completeOrderStep(orderId, stepId, status, comment, data = {}) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Наряд не найден')
  const step = order.steps.find((s) => s.id === stepId)
  if (!step) throw new Error('Шаг не найден')
  step.status = status
  step.comment = comment || null
  step.completedAt = new Date().toISOString()
  if (!step.startedAt) {
    step.startedAt = step.completedAt
  }
  if (data.measurements) step.measurements = data.measurements
  if (data.materials) step.materials = data.materials
  return { ...step }
}

export function startOrderStep(orderId, stepId) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Наряд не найден')
  const step = order.steps.find((s) => s.id === stepId)
  if (!step) throw new Error('Шаг не найден')
  if (step.status === 'in_progress') return { ...step }
  step.status = 'in_progress'
  step.startedAt = new Date().toISOString()
  return { ...step }
}

export function getChecklistTemplate(type) {
  return cloneChecklist(CHECKLISTS[type] || [])
}
