import { test, expect } from '../fixtures/index.js'
import { BasePage } from '../pages/BasePage.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'

test.describe('НФТ-5, НФТ-6: устойчивость', () => {
  test('при disconnect значение в метрике не сбрасывается', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const detail = new EquipmentDetailPage(page, 'БУР-12')
    await detail.goto()
    // Берём метрику внутри основного content (не часы в header).
    const metric = page.locator('main .metric-value').first()
    await expect(metric).toBeVisible()
    const before = await metric.textContent()
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 5
        c.status = 'disconnected'
      }
      const s = window.__pinia?.state?.value?.sensors
      if (s) s.pollingActive = false
    })
    await page.waitForTimeout(1500)
    const after = await metric.textContent()
    expect(after).toBe(before)
  })

  test('после возврата online статус возвращается без reload', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const detail = new EquipmentDetailPage(page, 'БУР-12')
    await detail.goto()
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 5
        c.status = 'disconnected'
      }
    })
    const base = new BasePage(page)
    await expect(base.connectionStatus).toContainText('НЕТ СВЯЗИ')
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 0
        c.status = 'connected'
      }
    })
    await expect(base.connectionStatus).toContainText('ПОДКЛЮЧЕНО')
  })
})
