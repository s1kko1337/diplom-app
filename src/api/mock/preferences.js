import { defineCollection, read, write, resetCollection } from './_runtime'
import { createSeed } from './seed/preferences.seed'

defineCollection({ name: 'preferences', scope: 'user', schemaVersion: 1, seed: createSeed })

export function getPreferences() {
  return read('preferences')
}

export function updatePreferences(section, data) {
  const current = read('preferences')
  const next = { ...current, [section]: { ...current[section], ...data } }
  write('preferences', next)
  return next
}

export function updateTheme(theme) {
  const current = read('preferences')
  const next = { ...current, theme }
  write('preferences', next)
  return next
}

export function resetPreferences() {
  resetCollection('preferences')
  return read('preferences')
}
