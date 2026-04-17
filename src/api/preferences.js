import { request } from './client'
import * as mock from './mock/preferences'

export function getPreferences() {
  return request(() => mock.getPreferences())
}

export function updatePreferences(section, data) {
  return request(() => mock.updatePreferences(section, data))
}

export function updateTheme(theme) {
  return request(() => mock.updateTheme(theme))
}

export function resetPreferences() {
  return request(() => mock.resetPreferences())
}
