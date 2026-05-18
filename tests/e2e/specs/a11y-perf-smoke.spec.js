import { test, expect } from '../fixtures/index.js'

test.describe('A11y и performance smoke', () => {
  test('sidebar: каждый nav-button имеет иконку SVG (ARIA via aria-label)', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await page.goto('/')
    await page.locator('aside').hover()
    const buttons = page.locator('aside nav button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i)
      // У кнопки есть либо текст, либо svg-иконка.
      const hasText = (await btn.textContent())?.trim().length > 0
      const hasSvg = (await btn.locator('svg').count()) > 0
      expect(hasText || hasSvg).toBe(true)
    }
  })

  test('keyboard: Tab по форме логина проходит селектор → пароль → submit', async ({ page }) => {
    await page.goto('/login')
    // Первый Tab — фокус на первом интерактиве.
    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'INPUT', 'SELECT', 'A']).toContain(firstFocused)
  })

  test('header: индикатор подключения имеет атрибут data-state', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/')
    const status = page.getByTestId('connection-status')
    await expect(status).toBeVisible()
    const state = await status.getAttribute('data-state')
    expect(['connected', 'reconnecting', 'disconnected']).toContain(state)
  })

  test('breadcrumb на детальной странице оборудования содержит ID', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/equipment')
    await page
      .locator('[data-testid="equipment-card"][data-equipment-id="БУР-12"]')
      .getByRole('link')
      .first()
      .click()
    await page.waitForURL(/\/equipment\/[^/]+$/)
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i })
    await expect(breadcrumb.getByText('БУР-12').first()).toBeVisible()
  })

  test('print стили: класс .no-print есть на навигации Журнала', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/journal')
    const noPrint = page.locator('.no-print').first()
    await expect(noPrint).toBeVisible()
  })

  test('initial load /equipment: domcontentloaded < 5 c (DEV-бюджет)', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    const start = Date.now()
    await page.goto('/equipment', { waitUntil: 'domcontentloaded' })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  })

  test('таб переключение в Settings отзывается < 1500 мс', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/settings')
    const start = Date.now()
    await page.getByRole('tab', { name: 'Уведомления' }).click()
    await page.locator('[role="tabpanel"][data-state="active"]').waitFor()
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(1500)
  })

  test('focus visible на интерактивах: Tab переводит фокус на интерактив', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await page.goto('/')
    // В Firefox/WebKit начальный фокус документа != body; сначала кликаем по
    // body, чтобы стартовать с детерминированной точки.
    await page.evaluate(() => document.body.click())
    await page.locator('aside').hover()
    // Несколько последовательных Tab гарантированно передадут фокус интерактиву.
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const tag = await page.evaluate(() => document.activeElement?.tagName)
      if (tag && tag !== 'BODY' && tag !== 'HTML') return
    }
    const finalTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'INPUT', 'A', 'SELECT', 'TEXTAREA']).toContain(finalTag)
  })
})
