
import { test, expect } from '../fixtures/index.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'

test.describe('ФТ-5: Замены деталей', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('таб «Детали» показывает таблицу замен', async ({ page }) => {
    const detail = new EquipmentDetailPage(page, 'БУР-12')
    await detail.goto()
    await detail.openTab('Детали')
    const table = page.getByRole('table').first()
    await expect(table).toBeVisible()
    const rows = table.getByRole('row')
    expect(await rows.count()).toBeGreaterThan(1)
  })
})
