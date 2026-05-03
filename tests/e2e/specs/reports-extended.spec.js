import { test, expect } from '../fixtures/index.js'

async function readReports(page) {
  return await page.evaluate(() => {
    const raw = localStorage.getItem('rgm:v1:reports')
    return raw ? JSON.parse(raw) : []
  })
}

test.describe('Reports CRUD per role', () => {
  test('engineer: открывает /reports/create — видит 3 типа карточек', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/reports')
    await page.getByRole('button', { name: /Создать отчёт/ }).click()
    await expect(page).toHaveURL(/\/reports\/create$/)
    await expect(page.getByText(/Отчёт об инциденте/)).toBeVisible()
    await expect(page.getByText(/Отчёт смены/)).toBeVisible()
    await expect(page.getByText(/Аналитическая сводка/)).toBeVisible()
  })

  test('mechanic: на /reports/create видит ТОЛЬКО Отчёт об инциденте', async ({
    page,
    loginAs,
  }) => {
    await loginAs('mechanic')
    await page.goto('/reports')
    await page.getByRole('button', { name: /Создать отчёт/ }).click()
    await expect(page).toHaveURL(/\/reports\/create$/)
    await expect(page.getByText(/Отчёт об инциденте/)).toBeVisible()
    await expect(page.getByText(/Отчёт смены/)).toHaveCount(0)
    await expect(page.getByText(/Аналитическая сводка/)).toHaveCount(0)
  })

  test('engineer: создание Incident-отчёта (черновик) → появляется в списке', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await page.goto('/reports')
    await page.getByRole('button', { name: /Создать отчёт/ }).click()
    await page.getByRole('button', { name: /Отчёт об инциденте/ }).click()
    const titleInput = page.getByPlaceholder('Краткое описание инцидента')
    await titleInput.fill('Тестовый инцидент E2E')
    await page.getByRole('button', { name: /Сохранить черновик/ }).click()
    // После сохранения роутер уходит на /reports/<id>.
    await page.waitForURL(/\/reports\/report-/, { timeout: 10_000 })
    const reports = await readReports(page)
    const created = reports.find((r) => r.title === 'Тестовый инцидент E2E')
    expect(created).toBeTruthy()
    expect(created.status).toBe('draft')
  })

  test('engineer: публикация отчёта → status=published', async ({ page, loginAs }) => {
    await loginAs('engineer')
    // Прогреваем auth перед посещением guarded /reports/create.
    await page.goto('/reports')
    await expect
      .poll(async () => await page.evaluate(() => window.__pinia?.state?.value?.auth?.user?.role))
      .toBe('engineer')
    await page.getByRole('button', { name: /Создать отчёт/ }).click()
    await page.getByRole('button', { name: /Отчёт об инциденте/ }).click()
    await page.getByPlaceholder('Краткое описание инцидента').fill('Тестовая публикация')
    await page.getByRole('button', { name: /Опубликовать/ }).click()
    await page.waitForURL(/\/reports\/report-/, { timeout: 10_000 })
    const reports = await readReports(page)
    const created = reports.find((r) => r.title === 'Тестовая публикация')
    expect(created?.status).toBe('published')
  })

  test('engineer: фильтр по типу incident оставляет только incident-отчёты', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await page.goto('/reports')
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Инцидент' }).click()
    // Все видимые карточки в списке должны быть incident.
    const items = page.locator('a[href*="/reports/"]')
    const count = await items.count()
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(items.nth(i)).toContainText(/Отчёт об инциденте/i)
      }
    }
  })

  test('engineer: фильтр по статусу draft скрывает published', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/reports')
    // Нажимаем второй combobox (статус).
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /^Черновик$/ }).click()
    // Все видимые элементы — draft.
    const badges = page.getByText(/^(Черновик|Опубликован)$/)
    const count = await badges.count()
    for (let i = 0; i < count; i++) {
      await expect(badges.nth(i)).toHaveText('Черновик')
    }
  })

  test('engineer: «Сбросить» возвращает все фильтры в дефолт', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/reports')
    // Меняем фильтр.
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Инцидент' }).click()
    await page.getByRole('button', { name: 'Сбросить' }).click()
    await expect(page.getByRole('combobox').first()).toContainText(/Все типы/)
  })

  test('engineer: открытие отчёта показывает payload', async ({ page, loginAs }) => {
    await loginAs('engineer')
    // Прогреваем auth перед посещением guarded /reports/create.
    await page.goto('/reports')
    await expect
      .poll(async () => await page.evaluate(() => window.__pinia?.state?.value?.auth?.user?.role))
      .toBe('engineer')
    await page.getByRole('button', { name: /Создать отчёт/ }).click()
    await page.getByRole('button', { name: /Отчёт об инциденте/ }).click()
    await page.getByPlaceholder('Краткое описание инцидента').fill('Открыть E2E')
    await page.getByRole('button', { name: /Сохранить черновик/ }).click()
    // После сохранения сразу попадаем на детальную страницу.
    await page.waitForURL(/\/reports\/report-/, { timeout: 10_000 })
    await expect(page.getByText('Открыть E2E').first()).toBeVisible()
  })
})
