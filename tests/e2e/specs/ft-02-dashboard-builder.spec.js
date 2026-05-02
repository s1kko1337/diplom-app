import { test, expect } from '../fixtures/index.js'
import { EquipmentDashboardPage } from '../pages/EquipmentDashboardPage.js'
import { userKey } from '../helpers/storage.js'

const EQUIPMENT_ID = 'БУР-12'

test.describe('ФТ-2: Конструктор панели', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('включение редактирования открывает панель управления', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await expect(dash.addWidgetButton).toBeVisible()
    await expect(dash.resetButton).toBeVisible()
  })

  test('добавление виджета увеличивает количество карточек', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    const before = await dash.widgets.count()
    await dash.addWidget('Числовой индикатор', 'Температура двигателя')
    await expect(dash.widgets).toHaveCount(before + 1)
  })

  test('удаление виджета уменьшает количество карточек', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Давление')
    const before = await dash.widgets.count()
    await dash.widgets.last().getByRole('button').last().click()
    await expect(dash.widgets).toHaveCount(before - 1)
  })

  test('сохранение и reload восстанавливают раскладку', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Шкала (gauge)', 'Вибрация')
    const expected = await dash.widgets.count()
    await dash.saveButton.click()
    await expect(dash.configureButton).toBeVisible()
    await page.reload()
    await expect(dash.widgets).toHaveCount(expected)
  })

  test('сброс возвращает дефолтную раскладку', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Давление')
    await dash.saveButton.click()
    await expect(dash.configureButton).toBeVisible()
    const polluted = await dash.widgets.count()
    await dash.configureButton.click()
    await dash.resetButton.click()
    await expect(dash.widgets).not.toHaveCount(polluted)
  })

  test('layout сохранён в localStorage пользователя', async ({ page, loginAs }) => {
    const user = await loginAs('engineer')
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Глубина бурения')
    await dash.saveButton.click()
    await expect(dash.configureButton).toBeVisible()
    const key = userKey(user.id, 'dashboards')
    await expect
      .poll(async () => await page.evaluate((k) => localStorage.getItem(k), key), { timeout: 7000 })
      .toContain(EQUIPMENT_ID)
  })
})
