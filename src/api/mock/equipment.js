import { defineCollection, read, patch, append, remove } from './_runtime'
import { createSeed, createSensors, createSbsh250Specs } from './seed/equipment.seed'
import { nextEquipmentId } from '@/utils/equipmentId'

// schemaVersion: 2 — пересев парка после перевода всех станков на СБШ-250МНА
// (старые сиды с DML-1200 / СБШ-320 в localStorage будут заменены).
defineCollection({ name: 'equipment', scope: 'global', schemaVersion: 2, seed: createSeed })

const DEFAULT_MODEL = 'СБШ-250МНА'

export function generateEquipmentId() {
  return nextEquipmentId(read('equipment').map((e) => e.id))
}

export function getEquipmentList() {
  return read('equipment').map(({ sensors: _s, specs: _sp, serviceHistory: _sh, ...rest }) => rest)
}

export function getEquipmentById(id) {
  return read('equipment').find((e) => e.id === id) || null
}

export function createEquipmentEntry(data) {
  // ID назначается автоматически, если не передан явно.
  const id = data.id || generateEquipmentId()
  if (getEquipmentById(id)) throw new Error(`Оборудование ${id} уже существует`)
  const model = data.model || DEFAULT_MODEL
  const year = Number(data.year) || new Date().getFullYear()
  const serial = data.serial || `SN-${year}-${id.replace(/\D/g, '') || '000'}`
  const isSbsh250 = model === DEFAULT_MODEL
  const entry = {
    id,
    model,
    fullModel: data.fullModel || (isSbsh250 ? `Буровой станок ${DEFAULT_MODEL}` : model),
    serial,
    year,
    status: data.status || 'idle',
    statusLabel: 'ПРОСТОЙ',
    operatingHours: Number(data.operatingHours) || 0,
    lastMaintenance: null,
    subsystemHealth: { hydraulic: 100, electrical: 100, mechanical: 100, compressor: 100 },
    // Новый станок сразу получает полный набор датчиков, чтобы быть доступным
    // для мониторинга и кастомизируемых дашбордов.
    sensors: createSensors(),
    specs: isSbsh250
      ? createSbsh250Specs(serial, year)
      : [
          { label: 'Модель', value: model },
          { label: 'Серийный номер', value: serial },
          { label: 'Год выпуска', value: String(year) },
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
