import { test, expect } from '../fixtures/index.js'
import { MaintenanceDetailPage } from '../pages/MaintenanceDetailPage.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

function orderWithMeasurement(id, measurementOverrides = {}) {
  const base = makeOrder({
    id,
    status: 'in_progress',
    assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
  })
  base.steps[0].status = 'in_progress'
  base.steps[0].measurements = [
    {
      id: 'm-1',
      description: 'Уровень масла в двигателе',
      norm: '80-100',
      unit: '%',
      fact: null,
      passed: null,
      ...measurementOverrides,
    },
  ]
  base.steps[0].materials = [
    {
      id: 'mat-1',
      name: 'Масло М10',
      brand: 'ROSNEFT',
      volume: null,
      unit: 'л',
    },
  ]
  return base
}

test.describe('ФТ-10: Измерения и материалы', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('mechanic')
  })

  test('измерение и материал отображаются в шаге', async ({ page }) => {
    await seedOrders(page, [orderWithMeasurement('ORD-MM-1')])
    const detail = new MaintenanceDetailPage(page, 'ORD-MM-1')
    await detail.goto()
    await expect(page.getByText('Уровень масла в двигателе', { exact: true })).toBeVisible()
    await expect(page.getByText(/Норма:.*80-100.*%/)).toBeVisible()
    await expect(page.getByText('Масло М10')).toBeVisible()
  })

  test('ввод значения в норме помечает шаг passed', async ({ page }) => {
    await seedOrders(page, [orderWithMeasurement('ORD-MM-2')])
    const detail = new MaintenanceDetailPage(page, 'ORD-MM-2')
    await detail.goto()
    const factInput = page.locator('input[type="number"]').first()
    await factInput.fill('90')
    await detail.markPassedButton.first().click()
    await expect
      .poll(async () => {
        return await page.evaluate((id) => {
          const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
          return orders.find((o) => o.id === id)?.steps[0]?.status
        }, 'ORD-MM-2')
      })
      .toBe('passed')
  })
})
