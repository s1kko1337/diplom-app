const STORAGE_KEY = 'rudgormash_dashboards'

function getDefaultConfig(equipmentId) {
  return {
    equipmentId,
    widgets: [
      {
        id: 'w1',
        type: 'numeric-indicator',
        sensorId: 'temp-engine',
        props: { title: 'Температура двигателя' },
        layout: { x: 0, y: 0, w: 3, h: 2, i: 'w1' },
      },
      {
        id: 'w2',
        type: 'numeric-indicator',
        sensorId: 'speed',
        props: { title: 'Скорость вращения' },
        layout: { x: 3, y: 0, w: 3, h: 2, i: 'w2' },
      },
      {
        id: 'w3',
        type: 'numeric-indicator',
        sensorId: 'depth',
        props: { title: 'Глубина бурения' },
        layout: { x: 6, y: 0, w: 3, h: 2, i: 'w3' },
      },
      {
        id: 'w4',
        type: 'numeric-indicator',
        sensorId: 'pressure',
        props: { title: 'Давление' },
        layout: { x: 9, y: 0, w: 3, h: 2, i: 'w4' },
      },
      {
        id: 'w5',
        type: 'line-chart',
        sensorId: 'temp-engine',
        props: { title: 'Температура (график)' },
        layout: { x: 0, y: 2, w: 6, h: 4, i: 'w5' },
      },
      {
        id: 'w6',
        type: 'gauge',
        sensorId: 'engine-load',
        props: { title: 'Загрузка двигателя' },
        layout: { x: 6, y: 2, w: 3, h: 4, i: 'w6' },
      },
      {
        id: 'w7',
        type: 'gauge',
        sensorId: 'tool-wear',
        props: { title: 'Износ долота' },
        layout: { x: 9, y: 2, w: 3, h: 4, i: 'w7' },
      },
    ],
  }
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(configs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

export function getDashboardConfig(equipmentId) {
  const all = loadAll()
  return all[equipmentId] || getDefaultConfig(equipmentId)
}

export function saveDashboardConfig(equipmentId, config) {
  const all = loadAll()
  all[equipmentId] = { ...config, equipmentId }
  saveAll(all)
  return all[equipmentId]
}

export function resetDashboardConfig(equipmentId) {
  const all = loadAll()
  delete all[equipmentId]
  saveAll(all)
  return getDefaultConfig(equipmentId)
}
