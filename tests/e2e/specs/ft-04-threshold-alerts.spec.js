import { test, expect } from '../fixtures/index.js'
import { AlertsPage } from '../pages/AlertsPage.js'
import { seedAlerts } from '../fixtures/state.js'
import { makeAlert } from '../helpers/storage.js'

test.describe('ФТ-4: Уведомления о порогах', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('критическое уведомление видно в /alerts со всеми атрибутами', async ({ page }) => {
    await seedAlerts(page, [
      makeAlert({
        id: 'A-T1',
        type: 'critical',
        title: 'КРИТИЧЕСКАЯ ТЕМПЕРАТУРА',
        description: 'Температура 99°C превысила порог 95°C',
        equipmentId: 'БУР-03',
        sensorId: 'temp-engine',
        value: 99,
        threshold: 95,
      }),
    ])
    const alerts = new AlertsPage(page)
    await alerts.goto()
    const card = page.locator('[data-alert-id="A-T1"]')
    await expect(card).toBeVisible()
    await expect(card).toContainText('БУР-03')
    await expect(card).toContainText(/99/)
    await expect(card).toContainText('Критическое')
  })

  test('бейдж в шапке отражает кол-во неподтверждённых', async ({ page }) => {
    await seedAlerts(page, [
      makeAlert({ id: 'A-T1', type: 'warning', acknowledged: false }),
      makeAlert({ id: 'A-T2', type: 'warning', acknowledged: false }),
      makeAlert({ id: 'A-T3', type: 'warning', acknowledged: true }),
    ])
    await page.goto('/')
    const badge = page.locator('header button').filter({ hasText: /^\d+$/ }).first()
    await expect(badge).toHaveText('2')
  })

  test('подтверждение уменьшает счётчик и помечает карточку', async ({ page }) => {
    await seedAlerts(page, [makeAlert({ id: 'A-T1', acknowledged: false, type: 'warning' })])
    const alerts = new AlertsPage(page)
    await alerts.goto()
    await alerts.acknowledge('A-T1')
    await expect(page.locator('[data-alert-id="A-T1"]')).toHaveAttribute(
      'data-alert-acknowledged',
      '1',
    )
  })
})
