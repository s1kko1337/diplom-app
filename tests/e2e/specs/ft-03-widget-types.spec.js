import { test, expect } from '../fixtures/index.js'
import { EquipmentDashboardPage } from '../pages/EquipmentDashboardPage.js'

const EQUIPMENT_ID = 'БУР-12'

test.describe('ФТ-3: Типы виджетов', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('Numeric: число + единица + бейдж', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Температура двигателя')
    const widget = dash.widgetByType('numeric-indicator').last()
    await expect(widget).toContainText('°C')
    await expect(widget.locator('.metric-value')).toBeVisible()
  })

  test('Line chart: canvas виден и имеет ненулевой размер', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Линейный график', 'Скорость вращения')
    const canvas = dash.widgetByType('line-chart').last().locator('canvas')
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    expect(box.width).toBeGreaterThan(50)
    expect(box.height).toBeGreaterThan(50)
  })

  test('Gauge: canvas виден', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Шкала (gauge)', 'Давление')
    const canvas = dash.widgetByType('gauge').last().locator('canvas')
    await expect(canvas).toBeVisible()
  })
})
