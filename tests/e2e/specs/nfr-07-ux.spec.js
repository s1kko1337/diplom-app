import { test, expect } from '../fixtures/index.js'
import { SettingsPage } from '../pages/SettingsPage.js'
import { EquipmentListPage } from '../pages/EquipmentListPage.js'

test.describe('НФТ-7: UX', () => {
  test('сохранение настроек выводит сообщение об успехе', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const settings = new SettingsPage(page)
    await settings.goto()
    await settings.saveButton.click()
    await expect(settings.successBanner).toBeVisible()
  })

  test('удаление оборудования требует подтверждения', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const list = new EquipmentListPage(page)
    await list.goto()
    await list.cardById('БУР-12').getByRole('button', { name: /Удалить/ }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
