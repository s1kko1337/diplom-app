export const STORAGE_PREFIX = 'rgm'
export const SCHEMA_VERSION = 1

export function globalKey(name) {
  return `${STORAGE_PREFIX}:v${SCHEMA_VERSION}:${name}`
}

export function userKey(userId, name) {
  return `${STORAGE_PREFIX}:v${SCHEMA_VERSION}:user:${userId}:${name}`
}

export function metaKey(name) {
  return `${STORAGE_PREFIX}:meta:${name}`
}

export function userMetaKey(userId, name) {
  return `${STORAGE_PREFIX}:meta:user:${userId}:${name}`
}

export function makeAlert(overrides = {}) {
  return {
    id: 'A-TEST-' + Date.now(),
    type: 'critical',
    title: 'ТЕСТОВОЕ КРИТИЧЕСКОЕ',
    description: 'Превышение порогового значения по тесту',
    equipmentId: 'БУР-01',
    sensorId: 'temp-engine',
    value: 99,
    threshold: 95,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    acknowledged: false,
    ...overrides,
  }
}

export function makeOrder(overrides = {}) {
  const now = new Date().toISOString()
  return {
    id: 'ORD-TEST-' + Date.now(),
    equipmentId: 'БУР-04',
    type: 'ТО-1',
    status: 'planned',
    createdAt: now,
    scheduledDate: now,
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    steps: [
      {
        id: 'step-1',
        title: 'Проверка масла',
        description: 'Проверить уровень масла в двигателе',
        status: 'pending',
        normative: { min: 80, max: 100, unit: '%' },
        measurements: [],
        materials: [],
      },
      {
        id: 'step-2',
        title: 'Замена фильтра',
        description: 'Заменить топливный фильтр',
        status: 'pending',
        measurements: [],
        materials: [],
      },
      {
        id: 'step-3',
        title: 'Контроль вибрации',
        description: 'Замерить вибрацию двигателя',
        status: 'pending',
        normative: { min: 0, max: 1.5, unit: 'мм/с' },
        measurements: [],
        materials: [],
      },
    ],
    ...overrides,
  }
}
