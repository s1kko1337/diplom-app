import { defineCollection, read, patch, append, remove } from './_runtime'
import { createSeed } from './seed/equipment.seed'

defineCollection({ name: 'equipment', scope: 'global', schemaVersion: 1, seed: createSeed })

export function getEquipmentList() {
  return read('equipment').map(({ sensors: _s, specs: _sp, serviceHistory: _sh, ...rest }) => rest)
}

export function getEquipmentById(id) {
  return read('equipment').find((e) => e.id === id) || null
}

export function createEquipmentEntry(data) {
  if (!data.id) throw new Error('ID обязателен')
  if (getEquipmentById(data.id)) throw new Error(`Оборудование ${data.id} уже существует`)
  const entry = {
    id: data.id,
    model: data.model || '—',
    fullModel: data.fullModel || data.model || '—',
    serial: data.serial || `SN-${Date.now()}`,
    year: Number(data.year) || new Date().getFullYear(),
    status: data.status || 'idle',
    statusLabel: 'ПРОСТОЙ',
    operatingHours: Number(data.operatingHours) || 0,
    lastMaintenance: null,
    subsystemHealth: { hydraulic: 100, electrical: 100, mechanical: 100, compressor: 100 },
    sensors: [],
    specs: [
      { label: 'Модель', value: data.model || '—' },
      { label: 'Серийный номер', value: data.serial || '—' },
      { label: 'Год выпуска', value: String(data.year || new Date().getFullYear()) },
    ],
    serviceHistory: [],
  }
  append('equipment', entry)
  const { sensors: _s, specs: _sp, serviceHistory: _sh, ...rest } = entry
  return rest
}

export function updateEquipmentStatus(id, status) {
  const statusLabel = status.toUpperCase()
  const updated = patch('equipment', id, { status, statusLabel })
  if (!updated) throw new Error(`Оборудование ${id} не найдено`)
  const { sensors: _s, specs: _sp, serviceHistory: _sh, ...rest } = updated
  return rest
}

export function deleteEquipmentEntry(id) {
  const ok = remove('equipment', id)
  if (!ok) throw new Error(`Оборудование ${id} не найдено`)
  return { id }
}

export function getEquipmentSensors(id) {
  const eq = getEquipmentById(id)
  return eq?.sensors ?? []
}

export function getLiveSensorData(id) {
  const eq = getEquipmentById(id)
  if (!eq) return {}

  const result = {}
  for (const sensor of eq.sensors || []) {
    const variance = (sensor.max - sensor.min) * 0.02
    const drift = (Math.random() - 0.5) * variance * 2
    const value = Math.max(sensor.min, Math.min(sensor.max, sensor.currentValue + drift))
    result[sensor.id] = {
      sensorId: sensor.id,
      value: +value.toFixed(sensor.unit === '°C' || sensor.unit === 'мм/с' ? 1 : 0),
      timestamp: new Date().toISOString(),
    }
  }
  return result
}
