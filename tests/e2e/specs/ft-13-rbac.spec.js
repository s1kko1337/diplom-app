import { test, expect } from '../fixtures/index.js'

async function expandSidebar(page) {
  await page.locator('aside').hover()
}

test.describe('ФТ-13: RBAC по ролям', () => {
  test('engineer видит ключевые разделы меню', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/')
    await expandSidebar(page)
    const sidebar = page.locator('aside')
    for (const label of [
      'Главная',
      'Мониторинг',
      'Оборудование',
      'Техобслуживание',
      'Журнал ТС',
      'Аналитика',
      'Отчёты',
    ]) {
      await expect(sidebar.getByRole('button', { name: label })).toBeVisible()
    }
  })

  test('mechanic не видит «Мониторинг», «Аналитика», «Журнал ТС»', async ({ page, loginAs }) => {
    await loginAs('mechanic')
    await page.goto('/')
    await expandSidebar(page)
    const sidebar = page.locator('aside')
    await expect(sidebar.getByRole('button', { name: 'Мониторинг' })).toHaveCount(0)
    await expect(sidebar.getByRole('button', { name: 'Аналитика' })).toHaveCount(0)
    await expect(sidebar.getByRole('button', { name: 'Журнал ТС' })).toHaveCount(0)
  })

  test('mechanic видит кнопку «Создать отчёт» (только incident-тип)', async ({ page, loginAs }) => {
    await loginAs('mechanic')
    await page.goto('/reports')
    // Механик имеет право только на incident_report — но кнопка «Создать отчёт» отображается.
    await expect(page.getByRole('button', { name: /Создать отчёт/ })).toBeVisible()
  })

  test('engineer может открыть форму создания отчёта по ссылке', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/reports')
    // Ждём, пока auth подтянет пользователя и кнопка станет доступна для guard'а.
    await expect
      .poll(async () => await page.evaluate(() => window.__pinia?.state?.value?.auth?.user?.role))
      .toBe('engineer')
    await page.getByRole('button', { name: /Создать отчёт/ }).click()
    await expect(page).toHaveURL(/\/reports\/create$/)
  })

  test('foreman видит «Аналитика» и «Журнал ТС»', async ({ page, loginAs }) => {
    await loginAs('foreman')
    await page.goto('/')
    await expandSidebar(page)
    const sidebar = page.locator('aside')
    await expect(sidebar.getByRole('button', { name: 'Аналитика' })).toBeVisible()
    await expect(sidebar.getByRole('button', { name: 'Журнал ТС' })).toBeVisible()
  })
})
