import { test, expect } from '../fixtures/index.js'
import { MaintenanceDetailPage } from '../pages/MaintenanceDetailPage.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

test.describe('Сценарии foreman', () => {
  test('S-F1: приёмка наряда → completed → доступен акт', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-F1',
      status: 'review',
      type: 'ТО-1',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    order.steps = order.steps.map((s) => ({ ...s, status: 'passed' }))
    await seedOrders(page, [order])
    await loginAs('foreman')
    const detail = new MaintenanceDetailPage(page, 'ORD-F1')
    await detail.goto()
    await detail.approveButton.click()
    await expect
      .poll(async () => {
        return await page.evaluate((id) => {
          const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
          return orders.find((o) => o.id === id)?.status
        }, 'ORD-F1')
      })
      .toBe('completed')
    await page.goto('/maintenance/ORD-F1/document')
    await expect(page.getByText(/АКТ/i).first()).toBeVisible()
  })

  test('S-F2: возврат наряда на доработку → in_progress', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-F2',
      status: 'review',
      type: 'ТО-1',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    order.steps = order.steps.map((s) => ({ ...s, status: 'passed' }))
    await seedOrders(page, [order])
    await loginAs('foreman')
    const detail = new MaintenanceDetailPage(page, 'ORD-F2')
    await detail.goto()
    await detail.returnButton.click()
    await page.getByRole('textbox').first().fill('Перепроверить шаг 1')
    await page
      .getByRole('button', { name: /Отправить|Вернуть$|Подтвердить/ })
      .first()
      .click()
    await expect
      .poll(async () => {
        return await page.evaluate((id) => {
          const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
          return orders.find((o) => o.id === id)?.status
        }, 'ORD-F2')
      })
      .toMatch(/^(in_progress|planned)$/)
  })
})
