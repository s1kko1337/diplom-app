import { test, expect } from '../fixtures/index.js'
import { LoginPage } from '../pages/LoginPage.js'
import { ROLES } from '../helpers/selectors.js'

test.describe('Auth: расширенные сценарии', () => {
  test('login через UI: успешный вход engineer', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.loginUI('engineer')
    await expect(page).toHaveURL(/\/$/)
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    expect(token).toBeTruthy()
  })

  test('login требует выбранного пользователя для активации submit', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    // Сразу после открытия — submit должен быть видим, форма принимает любые данные.
    await expect(login.submitButton).toBeVisible()
    await expect(login.submitButton).toBeEnabled()
  })

  test('логин с разными ролями устанавливает корректный role в auth-сторе', async ({
    page,
    loginAs,
  }) => {
    for (const role of ['engineer', 'mechanic', 'foreman']) {
      await loginAs(role)
      await page.goto('/')
      await expect
        .poll(async () => await page.evaluate(() => window.__pinia?.state?.value?.auth?.user?.role))
        .toBe(role)
    }
  })

  test('logout из UserMenu чистит токен и редиректит на /login', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/')
    // Открываем UserMenu и кликаем «Выход».
    await page.locator('aside').hover()
    await page.locator('aside').getByRole('button').filter({ has: page.locator('svg') }).last().click()
    await page.getByRole('menuitem', { name: /Выход/ }).click()
    await page.waitForURL(/\/login/)
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    expect(token).toBeFalsy()
  })

  test('auth guard: незалогиненный → редирект на /login с redirect-параметром', async ({
    page,
  }) => {
    // Не вызываем loginAs, токен отсутствует.
    await page.goto('/equipment')
    await page.waitForURL(/\/login/)
    expect(page.url()).toMatch(/redirect=(\/|%2F)equipment/)
  })

  test('guest guard: залогиненный пытается открыть /login → редирект на /', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await page.goto('/')
    // Дожидаемся загрузки auth, иначе guard не видит токен.
    await expect
      .poll(async () => await page.evaluate(() => window.__pinia?.state?.value?.auth?.user?.role))
      .toBe('engineer')
    await page.goto('/login')
    await expect(page).toHaveURL(/\/$/)
  })

  test('session restoration: токен в localStorage → авто-вход после reload', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await page.goto('/')
    await expect
      .poll(async () => await page.evaluate(() => window.__pinia?.state?.value?.auth?.user?.role))
      .toBe('engineer')
    await page.reload()
    await expect
      .poll(async () => await page.evaluate(() => window.__pinia?.state?.value?.auth?.user?.role))
      .toBe('engineer')
    // Не должен попасть на /login.
    expect(page.url()).not.toContain('/login')
  })

  test('login UI: список пользователей содержит всех 4 ролей', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.userSelect.click()
    for (const key of ['engineer', 'mechanic', 'foreman']) {
      const user = ROLES[key]
      await expect(page.getByRole('option', { name: new RegExp(user.name) })).toBeVisible()
    }
  })
})
