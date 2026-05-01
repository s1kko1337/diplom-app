import { globalKey, userKey, metaKey, userMetaKey, SCHEMA_VERSION } from '../helpers/storage.js'

export async function resetMockState(page) {
  await page.addInitScript(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('rgm:') || key === 'auth_token' || key === 'auth_user_id') {
        localStorage.removeItem(key)
      }
    }
  })
}

export async function seedAlerts(page, alerts) {
  await page.addInitScript(({ key, metaKey, version, data }) => {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(metaKey, JSON.stringify({ schemaVersion: version }))
  }, {
    key: globalKey('alerts'),
    metaKey: metaKey('alerts'),
    version: SCHEMA_VERSION,
    data: alerts,
  })
}

export async function seedOrders(page, orders) {
  await page.addInitScript(({ key, metaKey, version, data }) => {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(metaKey, JSON.stringify({ schemaVersion: version }))
  }, {
    key: globalKey('orders'),
    metaKey: metaKey('orders'),
    version: SCHEMA_VERSION,
    data: orders,
  })
}

export async function seedDashboard(page, userId, config) {
  await page.addInitScript(({ key, metaKey, version, data }) => {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(metaKey, JSON.stringify({ schemaVersion: version }))
  }, {
    key: userKey(userId, 'dashboards'),
    metaKey: userMetaKey(userId, 'dashboards'),
    version: SCHEMA_VERSION,
    data: config,
  })
}
