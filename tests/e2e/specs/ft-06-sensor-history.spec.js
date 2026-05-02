import { test, expect } from '../fixtures/index.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'

test.describe('ФТ-6: История показаний', () => {
  test('таб «История»: выбор датчика → график', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const detail = new EquipmentDetailPage(page, 'БУР-12')
    await detail.goto()
    await detail.openTab('История')
    const sensorCombobox = page.getByRole('combobox').first()
    await expect(sensorCombobox).toBeVisible()
    await sensorCombobox.click()
    await page.getByRole('option').filter({ hasText: /Температура двигателя/ }).click()
    await page.getByRole('button', { name: /ЗАГРУЗИТЬ/ }).click()
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 })
  })
})
