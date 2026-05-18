import { test, expect } from '../fixtures/index.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

test.describe('ФТ-11: Формирование документов', () => {
  test('completed-наряд имеет страницу акта с реквизитами', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-DOC',
      status: 'completed',
      type: 'ТО-1',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    order.steps = order.steps.map((s) => ({ ...s, status: 'passed' }))
    await seedOrders(page, [order])
    await loginAs('engineer')
    await page.goto('/maintenance/ORD-DOC/document')
    await expect(page.getByText(/АКТ/i).first()).toBeVisible()
    await expect(page.getByText('БУР-04').first()).toBeVisible()
    await expect(page.getByText(/Петров/).first()).toBeVisible()
  })
})
