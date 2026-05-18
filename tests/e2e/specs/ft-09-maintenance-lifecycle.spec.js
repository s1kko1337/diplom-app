import { test, expect } from '../fixtures/index.js'
import { MaintenanceDetailPage } from '../pages/MaintenanceDetailPage.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

async function readOrderStatus(page, orderId) {
  return await page.evaluate((id) => {
    const raw = localStorage.getItem('rgm:v1:orders')
    if (!raw) return null
    const orders = JSON.parse(raw)
    return orders.find((o) => o.id === id)?.status ?? null
  }, orderId)
}

test.describe('ФТ-9: Жизненный цикл наряда', () => {
  test('mechanic запускает наряд и переводит шаг в passed', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-LC-1',
      status: 'planned',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-LC-1')
    await detail.goto()
    await page.getByRole('button', { name: /Начать выполнение/ }).click()
    await detail.markPassedButton.first().click()
    await expect
      .poll(async () => {
        return await page.evaluate((id) => {
          const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
          return orders.find((o) => o.id === id)?.steps[0]?.status
        }, 'ORD-LC-1')
      })
      .toBe('passed')
  })

  test('mechanic отправляет наряд на приёмку → review', async ({ page, loginAs }) => {
    const baseOrder = makeOrder({
      id: 'ORD-LC-2',
      status: 'in_progress',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    baseOrder.steps = baseOrder.steps.map((s) => ({ ...s, status: 'passed' }))
    await seedOrders(page, [baseOrder])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-LC-2')
    await detail.goto()
    await detail.finishButton.click()
    await detail.submitForReviewButton.click()
    await expect.poll(() => readOrderStatus(page, 'ORD-LC-2')).toBe('review')
  })

  test('foreman утверждает наряд → completed', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-LC-3',
      status: 'review',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    order.steps = order.steps.map((s) => ({ ...s, status: 'passed' }))
    await seedOrders(page, [order])
    await loginAs('foreman')
    const detail = new MaintenanceDetailPage(page, 'ORD-LC-3')
    await detail.goto()
    await detail.approveButton.click()
    await expect.poll(() => readOrderStatus(page, 'ORD-LC-3')).toBe('completed')
  })

  test('foreman возвращает наряд на доработку → in_progress', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-LC-4',
      status: 'review',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    order.steps = order.steps.map((s) => ({ ...s, status: 'passed' }))
    await seedOrders(page, [order])
    await loginAs('foreman')
    const detail = new MaintenanceDetailPage(page, 'ORD-LC-4')
    await detail.goto()
    await detail.returnButton.click()
    const reasonField = page.getByPlaceholder(/комментарий|причин/i).or(page.getByRole('textbox'))
    await reasonField.first().fill('Перепроверить шаг 1')
    await page.getByRole('button', { name: /Отправить|Вернуть$|Подтвердить/ }).first().click()
    await expect
      .poll(() => readOrderStatus(page, 'ORD-LC-4'))
      .toMatch(/^(in_progress|planned)$/)
  })
})
