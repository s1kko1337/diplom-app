import { test as base, expect } from '@playwright/test'
import { injectAuthToStorage } from './auth.js'
import { resetMockState } from './state.js'

export const test = base.extend({
  cleanState: [async ({ page }, use) => {
    await resetMockState(page)
    await use(undefined)
  }, { auto: true }],

  loginAs: async ({ page }, use) => {
    const fn = async (role) => {
      const user = await injectAuthToStorage(page, role)
      return user
    }
    await use(fn)
  },
})

export { expect }
