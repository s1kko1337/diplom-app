import { defineCollection, read } from './_runtime'
import { createSeed } from './seed/parts.seed'

defineCollection({ name: 'parts', scope: 'global', schemaVersion: 1, seed: createSeed })

export function getReplacements(equipmentId) {
  const data = read('parts')
  return data[equipmentId] ? [...data[equipmentId]] : []
}
