import { test, expect } from '../fixtures/index.js'
import { MaintenanceDetailPage } from '../pages/MaintenanceDetailPage.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

test.describe('Сценарии mechanic', () => {
  test('S-M1: завершённые шаги → submit → review', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-M1',
      status: 'in_progress',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    order.steps = order.steps.map((s) => ({ ...s, status: 'passed' }))
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-M1')
    await detail.goto()
    await detail.finishButton.click()
    await detail.submitForReviewButton.click()
    await expect
      .poll(async () => {
        return await page.evaluate((id) => {
          const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
          return orders.find((o) => o.id === id)?.status
        }, 'ORD-M1')
      })
      .toBe('review')
  })

  test('S-M2: ограничения видимости меню', async ({ page, loginAs }) => {
    await loginAs('mechanic')
    await page.goto('/')
    await page.locator('aside').hover()
    const sidebar = page.locator('aside')
    await expect(sidebar.getByRole('button', { name: 'Мониторинг' })).toHaveCount(0)
    await expect(sidebar.getByRole('button', { name: 'Аналитика' })).toHaveCount(0)
    await expect(sidebar.getByRole('button', { name: 'Журнал ТС' })).toHaveCount(0)
  })
})
