import { test, expect } from '../fixtures/index.js'
import { HomePage } from '../pages/HomePage.js'
import { AlertsPage } from '../pages/AlertsPage.js'
import { EquipmentDashboardPage } from '../pages/EquipmentDashboardPage.js'
import { seedAlerts } from '../fixtures/state.js'
import { makeAlert } from '../helpers/storage.js'

test.describe('Сценарии engineer', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('S-E1: открытие смены — обзор парка и подтверждение алерта', async ({ page }) => {
    await seedAlerts(page, [makeAlert({ id: 'A-S1', type: 'critical', acknowledged: false })])
    const home = new HomePage(page)
    await home.goto()
    await expect(home.heading).toBeVisible()
    const alerts = new AlertsPage(page)
    await alerts.goto()
    await alerts.acknowledge('A-S1')
    await expect(page.locator('[data-alert-id="A-S1"]')).toHaveAttribute(
      'data-alert-acknowledged',
      '1',
    )
  })

  test('S-E3: добавление двух виджетов и сохранение', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-12')
    await dash.goto()
    // Дожидаемся загрузки дефолтной раскладки.
    await expect(dash.widgets.first()).toBeVisible()
    const initial = await dash.widgets.count()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Температура двигателя')
    await dash.addWidget('Шкала (gauge)', 'Давление')
    await dash.saveButton.click()
    await expect(dash.configureButton).toBeVisible()
    await expect(dash.widgets).toHaveCount(initial + 2)
  })
})
