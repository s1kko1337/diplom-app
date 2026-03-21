export const alertsDb = [
  {
    id: 'A-001',
    type: 'critical',
    title: 'КРИТИЧЕСКАЯ ТЕМПЕРАТУРА',
    description: 'Температура двигателя превысила допустимый предел 95°C',
    equipmentId: 'БУР-03',
    sensorId: 'temp-engine',
    value: 95,
    threshold: 95,
    timestamp: '2026-02-16 14:23:45',
    acknowledged: false,
  },
  {
    id: 'A-002',
    type: 'warning',
    title: 'ПОВЫШЕННАЯ ВИБРАЦИЯ',
    description: 'Уровень вибрации превышает нормальные показатели',
    equipmentId: 'БУР-12',
    sensorId: 'vibration',
    value: 1.8,
    threshold: 1.5,
    timestamp: '2026-02-16 13:45:12',
    acknowledged: false,
  },
  {
    id: 'A-003',
    type: 'warning',
    title: 'ИЗНОС ИНСТРУМЕНТА',
    description: 'Износ долота достиг 75%, рекомендуется замена',
    equipmentId: 'БУР-08',
    sensorId: 'tool-wear',
    value: 75,
    threshold: 70,
    timestamp: '2026-02-16 12:30:00',
    acknowledged: true,
  },
  {
    id: 'A-004',
    type: 'info',
    title: 'ПЛАНОВОЕ ОБСЛУЖИВАНИЕ',
    description: 'Приближается срок планового технического обслуживания',
    equipmentId: 'БУР-15',
    sensorId: null,
    value: null,
    threshold: null,
    timestamp: '2026-02-16 10:15:30',
    acknowledged: true,
  },
  {
    id: 'A-005',
    type: 'success',
    title: 'ОБСЛУЖИВАНИЕ ЗАВЕРШЕНО',
    description: 'Плановое ТО успешно выполнено',
    equipmentId: 'БУР-21',
    sensorId: null,
    value: null,
    threshold: null,
    timestamp: '2026-02-16 09:00:00',
    acknowledged: true,
  },
  {
    id: 'A-006',
    type: 'warning',
    title: 'НИЗКИЙ УРОВЕНЬ ТОПЛИВА',
    description: 'Уровень топлива ниже 25%',
    equipmentId: 'БУР-03',
    sensorId: 'fuel-rate',
    value: 24.2,
    threshold: 22,
    timestamp: '2026-02-16 08:45:22',
    acknowledged: true,
  },
  {
    id: 'A-007',
    type: 'maintenance',
    title: 'Приближается ТО-1',
    description: 'До планового ТО-1 осталось 42 часа наработки',
    equipmentId: 'БУР-12',
    sensorId: null,
    value: null,
    threshold: null,
    timestamp: '2026-03-17T08:00:00',
    acknowledged: false,
  },
  {
    id: 'A-008',
    type: 'maintenance',
    title: 'Просрочено ТО-1',
    description: 'Плановое ТО-1 просрочено на 150 часов наработки',
    equipmentId: 'БУР-03',
    sensorId: null,
    value: null,
    threshold: null,
    timestamp: '2026-03-16T10:30:00',
    acknowledged: false,
  },
  {
    id: 'A-009',
    type: 'maintenance',
    title: 'Приближается ТО-2',
    description: 'До планового ТО-2 осталось 100 часов наработки',
    equipmentId: 'БУР-08',
    sensorId: null,
    value: null,
    threshold: null,
    timestamp: '2026-03-15T14:00:00',
    acknowledged: true,
  },
]

let alertIdCounter = 10

export function getAlerts(equipmentId) {
  if (equipmentId) {
    return alertsDb.filter((a) => a.equipmentId === equipmentId)
  }
  return [...alertsDb]
}

export function acknowledgeAlert(id) {
  const alert = alertsDb.find((a) => a.id === id)
  if (alert) {
    alert.acknowledged = true
    return true
  }
  return false
}

export function addAlert(alert) {
  const newAlert = {
    ...alert,
    id: `A-${String(alertIdCounter++).padStart(3, '0')}`,
    timestamp: new Date().toLocaleString('ru-RU'),
    acknowledged: false,
  }
  alertsDb.unshift(newAlert)
  return newAlert
}
