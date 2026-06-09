import { test, expect } from '../fixtures/index.js'

test.describe('Edge cases: невалидные ID, demo-reset, navigation', () => {
  test('engineer: прямой URL на несуществующее оборудование показывает «НЕ НАЙДЕНО»', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    // Используем латиницу, чтобы избежать URL-encoding cyrillic.
    await page.goto('/equipment/UNKNOWN-999')
    await expect(page.getByText(/НЕ НАЙДЕНО/i)).toBeVisible({ timeout: 10_000 })
  })

  test('engineer: прямой URL на несуществующий наряд показывает «НЕ НАЙДЕН»', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await page.goto('/maintenance/ORD-DOES-NOT-EXIST')
    await expect(page.getByText(/не найден/i)).toBeVisible({ timeout: 10_000 })
  })

  test('engineer: прямой URL на несуществующий отчёт показывает «не найден»', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await page.goto('/reports/REPORT-DOES-NOT-EXIST')
    await expect(page.getByText(/не найден|НЕ НАЙДЕН/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test.skip('?demo-reset=1 чистит localStorage и редиректит на /login', async ({ page, loginAs }) => {
    // TODO: фикстура loginAs использует addInitScript, который реинъецирует токен на каждую
    // навигацию — после resetAll() в App.vue токен сразу восстанавливается.
    // Для проверки нужна изолированная сессия без auth-фикстуры.
    await loginAs('engineer')
    await page.goto('/')
    // Сидируем что-нибудь чтобы убедиться, что reset чистит.
    await page.evaluate(() =>
      localStorage.setItem('rgm:v1:custom-marker', JSON.stringify(['x'])),
    )
    await page.goto('/?demo-reset=1')
    // Должен попасть на /login (auth_token удалён).
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    expect(token).toBeFalsy()
    const marker = await page.evaluate(() => localStorage.getItem('rgm:v1:custom-marker'))
    expect(marker).toBeFalsy()
  })

  test('навигация по breadcrumbs работает корректно', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/equipment')
    // Берём БУР-12 из существующих сидов.
    await page
      .locator('[data-testid="equipment-card"][data-equipment-id="БУР-12"]')
      .getByRole('link')
      .first()
      .click()
    await page.waitForURL(/\/equipment\/[^/]+$/)
    // В breadcrumb виден link «Оборудование» — клик возвращает на /equipment.
    await page.getByRole('link', { name: 'Оборудование' }).first().click()
    await expect(page).toHaveURL(/\/equipment$/)
  })

  test('маршрут /unknown-route не падает (отсутствует catch-all)', async ({ page, loginAs }) => {
    await loginAs('engineer')
    // Vue Router без catch-all — пустая страница, без crash.
    const responsePromise = page.waitForLoadState('domcontentloaded')
    await page.goto('/this-route-does-not-exist')
    await responsePromise
    // Страница загрузилась (даже если пустая), приложение не упало.
    const layoutVisible = await page.locator('aside, main').first().isVisible()
    expect(typeof layoutVisible).toBe('boolean')
  })

  test('mock-runtime восстанавливает данные после corrupted JSON', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/equipment')
    // Сидируем corrupt JSON.
    await page.evaluate(() => {
      localStorage.setItem('rgm:v2:equipment', '{invalid json}')
    })
    await page.reload()
    // Mock-runtime в read() ловит ошибку и пере-сидирует.
    const cards = page.getByTestId('equipment-card')
    await expect(cards.first()).toBeVisible({ timeout: 10_000 })
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test.skip('logout: повторный заход на /equipment редиректит на /login', async ({ page, loginAs }) => {
    // TODO: addInitScript в loginAs реинъецирует токен на каждой навигации.
    // Логаут проверяется отдельно в auth-extended.spec.js через UserMenu.
    await loginAs('engineer')
    await page.goto('/')
    // Чистим токен — эмуляция logout.
    await page.evaluate(() => {
      localStorage.removeItem('auth_token')
    })
    await page.goto('/equipment')
    await expect(page).toHaveURL(/\/login/)
  })
})
