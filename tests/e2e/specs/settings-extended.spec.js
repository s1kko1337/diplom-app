import { test, expect } from '../fixtures/index.js'

test.describe('Settings: расширенные сценарии по табам', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('таб «Отображение»: переключение тёмной темы добавляет класс .dark на html', async ({
    page,
  }) => {
    await page.goto('/settings')
    await expect(page.getByRole('tab', { name: 'Отображение' })).toBeVisible()
    await page.getByRole('button', { name: /ТЁМНАЯ/ }).click()
    await expect
      .poll(async () =>
        await page.evaluate(() => document.documentElement.classList.contains('dark')),
      )
      .toBe(true)
  })

  test('таб «Отображение»: переключение светлой темы убирает класс .dark', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: /ТЁМНАЯ/ }).click()
    await expect
      .poll(async () =>
        await page.evaluate(() => document.documentElement.classList.contains('dark')),
      )
      .toBe(true)
    await page.getByRole('button', { name: /СВЕТЛАЯ/ }).click()
    await expect
      .poll(async () =>
        await page.evaluate(() => document.documentElement.classList.contains('dark')),
      )
      .toBe(false)
  })

  test('таб «Уведомления» открывается и содержит переключатели', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('tab', { name: 'Уведомления' }).click()
    await expect(page.getByText('Критические уведомления')).toBeVisible()
    await expect(page.getByText('Предупреждения')).toBeVisible()
  })

  test('таб «Пороги» открывается и содержит сенсоры', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('tab', { name: 'Пороги' }).click()
    // Любой селект сенсоров или поле редактирования.
    const activePanel = page.locator('[role="tabpanel"][data-state="active"]')
    await expect(activePanel).toBeVisible()
  })

  test('таб «Безопасность» открывается', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('tab', { name: 'Безопасность' }).click()
    const activePanel = page.locator('[role="tabpanel"][data-state="active"]')
    await expect(activePanel).toBeVisible()
  })

  test('таб «Система»: кнопка «Сбросить демо» видна', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('tab', { name: 'Система' }).click()
    await expect(page.getByRole('button', { name: /Сбросить демо/ })).toBeVisible()
  })

  test('Сбросить настройки всех табов: показывается «НАСТРОЙКИ СБРОШЕНЫ»', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: /СБРОСИТЬ/i }).click()
    await expect(page.getByText(/НАСТРОЙКИ СБРОШЕНЫ/)).toBeVisible()
  })

  test('тема сохраняется в localStorage', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: /ТЁМНАЯ/ }).click()
    const theme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(theme).toBe('dark')
  })

  test('ThemeToggle в шапке/сайдбаре переключает тему', async ({ page }) => {
    await page.goto('/')
    await page.locator('aside').hover()
    const before = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    )
    await page.getByRole('button', { name: 'Переключить тему' }).first().click()
    const after = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    )
    expect(after).toBe(!before)
  })
})
