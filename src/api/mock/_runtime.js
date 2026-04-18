const STORAGE_PREFIX = 'rgm'
const collections = new Map()

export function defineCollection(config) {
  const { name, scope = 'global', schemaVersion = 1, seed } = config
  if (!name) throw new Error('Collection name required')
  if (!seed) throw new Error('Collection seed factory required')
  if (scope !== 'global' && scope !== 'user') {
    throw new Error(`Invalid scope: ${scope}`)
  }
  collections.set(name, { name, scope, schemaVersion, seed })
}

function getCollection(name) {
  const c = collections.get(name)
  if (!c) throw new Error(`Collection not registered: ${name}`)
  return c
}

function getCurrentUserId() {
  return localStorage.getItem('auth_user_id')
}

function storageKey(collection) {
  const { name, scope, schemaVersion } = collection
  if (scope === 'global') {
    return `${STORAGE_PREFIX}:v${schemaVersion}:${name}`
  }
  const userId = getCurrentUserId()
  if (!userId) return null
  return `${STORAGE_PREFIX}:v${schemaVersion}:user:${userId}:${name}`
}

function metaKey(collection) {
  const { name, scope } = collection
  if (scope === 'global') {
    return `${STORAGE_PREFIX}:meta:${name}`
  }
  const userId = getCurrentUserId()
  if (!userId) return null
  return `${STORAGE_PREFIX}:meta:user:${userId}:${name}`
}

function readMeta(collection) {
  const key = metaKey(collection)
  if (!key) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeMeta(collection, meta) {
  const key = metaKey(collection)
  if (!key) return
  localStorage.setItem(key, JSON.stringify(meta))
}

function ensureSeeded(collection) {
  const key = storageKey(collection)
  if (!key) return null
  const meta = readMeta(collection)
  const needsSeed =
    !meta || meta.schemaVersion !== collection.schemaVersion || !localStorage.getItem(key)
  if (needsSeed) {
    const data = collection.seed()
    localStorage.setItem(key, JSON.stringify(data))
    writeMeta(collection, { schemaVersion: collection.schemaVersion })
    return data
  }
  return null
}

export function read(name) {
  const collection = getCollection(name)
  const key = storageKey(collection)
  if (!key) return collection.seed()
  const seeded = ensureSeeded(collection)
  if (seeded !== null) return seeded
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : collection.seed()
  } catch {
    console.warn(`[mock-runtime] Corrupted data for ${name}, reseeding`)
    const data = collection.seed()
    localStorage.setItem(key, JSON.stringify(data))
    return data
  }
}

export function write(name, data) {
  const collection = getCollection(name)
  const key = storageKey(collection)
  if (!key) throw new Error(`Cannot write user-scoped collection without userId: ${name}`)
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.warn(`[mock-runtime] Storage quota exceeded for ${name}`)
    }
    throw err
  }
}

export function patch(name, id, fields) {
  const data = read(name)
  if (!Array.isArray(data)) throw new Error(`patch requires array collection: ${name}`)
  const idx = data.findIndex((item) => item.id === id)
  if (idx === -1) return null
  data[idx] = { ...data[idx], ...fields }
  write(name, data)
  return data[idx]
}

export function remove(name, id) {
  const data = read(name)
  if (!Array.isArray(data)) throw new Error(`remove requires array collection: ${name}`)
  const filtered = data.filter((item) => item.id !== id)
  write(name, filtered)
  return filtered.length !== data.length
}

export function append(name, item) {
  const data = read(name)
  if (!Array.isArray(data)) throw new Error(`append requires array collection: ${name}`)
  data.push(item)
  write(name, data)
  return item
}

export function prepend(name, item) {
  const data = read(name)
  if (!Array.isArray(data)) throw new Error(`prepend requires array collection: ${name}`)
  data.unshift(item)
  write(name, data)
  return item
}

export function resetCollection(name) {
  const collection = getCollection(name)
  const key = storageKey(collection)
  if (key) localStorage.removeItem(key)
  const mkey = metaKey(collection)
  if (mkey) localStorage.removeItem(mkey)
}

const LEGACY_KEYS = [
  'settings_display',
  'settings_notifications',
  'settings_thresholds',
  'settings_security',
  'theme',
  'rudgormash_dashboards',
]

export function resetAll() {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(`${STORAGE_PREFIX}:`)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k))
}

export function listCollections() {
  return Array.from(collections.keys())
}

const MIGRATION_MARKER = 'rgm:migrated-legacy'

function readLegacyJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function migrateLegacyKeys() {
  if (localStorage.getItem(MIGRATION_MARKER)) return
  const userId = getCurrentUserId()
  if (!userId) return

  try {
    const display = readLegacyJson('settings_display')
    const notifications = readLegacyJson('settings_notifications')
    const thresholds = readLegacyJson('settings_thresholds')
    const security = readLegacyJson('settings_security')
    const theme = localStorage.getItem('theme')
    const legacyDashboards = readLegacyJson('rudgormash_dashboards')

    if (
      collections.has('preferences') &&
      (display || notifications || thresholds || security || theme)
    ) {
      const current = read('preferences')
      const merged = {
        ...current,
        display: { ...current.display, ...display },
        notifications: { ...current.notifications, ...notifications },
        thresholds: { ...current.thresholds, ...thresholds },
        security: { ...current.security, ...security },
        theme: theme || current.theme,
      }
      write('preferences', merged)
    }

    if (collections.has('dashboards') && legacyDashboards) {
      write('dashboards', legacyDashboards)
    }

    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k))
    localStorage.setItem(MIGRATION_MARKER, '1')
  } catch (err) {
    console.warn('[mock-runtime] Legacy migration failed:', err)
  }
}
