import { test, expect } from '../fixtures/index.js'
import { EquipmentDashboardPage } from '../pages/EquipmentDashboardPage.js'
import { VIEWPORTS } from '../helpers/viewport.js'

const EQUIPMENT_ID = 'БУР-12'

test.describe('Dashboard advanced', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('AddWidgetModal: ОТМЕНА закрывает без добавления', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await expect(dash.widgets.first()).toBeVisible()
    const initial = await dash.widgets.count()
    await dash.configureButton.click()
    await dash.addWidgetButton.click()
    await page.getByRole('button', { name: 'Числовой индикатор' }).click()
    await page.getByRole('button', { name: 'ОТМЕНА' }).click()
    await expect(dash.widgets).toHaveCount(initial)
  })

  test('AddWidgetModal: для sensor-виджета без датчика кнопка ДОБАВИТЬ заблокирована', async ({
    page,
  }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidgetButton.click()
    await page.getByRole('button', { name: 'Числовой индикатор' }).click()
    await expect(page.getByRole('button', { name: 'ДОБАВИТЬ' })).toBeDisabled()
  })

  test('Info-виджет (без датчика) добавляется без выбора датчика', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await expect(dash.widgets.first()).toBeVisible()
    const before = await dash.widgets.count()
    await dash.configureButton.click()
    await dash.addWidgetButton.click()
    await page.getByRole('button', { name: 'Краткая информация' }).click()
    // Секция датчика не показана.
    await expect(page.getByRole('button', { name: 'ДОБАВИТЬ' })).toBeEnabled()
    await page.getByRole('button', { name: 'ДОБАВИТЬ' }).click()
    await expect(dash.widgets).toHaveCount(before + 1)
    await expect(dash.widgetByType('info').first()).toBeVisible()
  })

  test('Status-виджет добавляется и показывает текущее состояние', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Индикатор статуса')
    await expect(dash.widgetByType('status').first()).toBeVisible()
  })

  test('Specs-виджет добавляется и видит таблицу характеристик', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Технические характеристики')
    await expect(dash.widgetByType('specs').first()).toBeVisible()
  })

  test('Service-history виджет: добавление и видимость', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('История обслуживания')
    await expect(dash.widgetByType('service-history').first()).toBeVisible()
  })

  test('Parts виджет: добавление и видимость', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Замены деталей')
    await expect(dash.widgetByType('parts').first()).toBeVisible()
  })

  test('Sensor-history-виджет: добавление с выбором датчика', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Исторические данные датчика', 'Температура двигателя')
    await expect(dash.widgetByType('sensor-history').first()).toBeVisible()
  })

  test('Maintenance-timeline виджет: добавление', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Цикл ТО')
    await expect(dash.widgetByType('maintenance-timeline').first()).toBeVisible()
  })

  test('Subsystem-health виджет: добавление', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Здоровье подсистем')
    await expect(dash.widgetByType('subsystem-health').first()).toBeVisible()
  })

  test('Удаление всех виджетов через сброс → дефолтная раскладка восстанавливается', async ({
    page,
  }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await expect(dash.widgets.first()).toBeVisible()
    const defaultCount = await dash.widgets.count()
    expect(defaultCount).toBeGreaterThan(0)
    await dash.configureButton.click()
    // Удаляем все виджеты подряд.
    while ((await dash.widgets.count()) > 0) {
      await dash.widgets.first().getByRole('button').last().click()
    }
    await expect(dash.widgets).toHaveCount(0)
    await dash.resetButton.click()
    await expect(dash.widgets).toHaveCount(defaultCount)
  })

  test('Mobile (390px): дашборд рендерится без overflow', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await page.setViewportSize(VIEWPORTS.mobile)
    await dash.goto()
    await expect(dash.widgets.first()).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(2)
  })

  test('Editing toggle: повторный клик «Сохранить» возвращает в режим просмотра', async ({
    page,
  }) => {
    const dash = new EquipmentDashboardPage(page, EQUIPMENT_ID)
    await dash.goto()
    await expect(dash.widgets.first()).toBeVisible()
    await dash.configureButton.click()
    await expect(dash.saveButton).toBeVisible()
    await dash.saveButton.click()
    await expect(dash.configureButton).toBeVisible()
  })
})
