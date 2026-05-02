import { test, expect } from '../fixtures/index.js'
import { BasePage } from '../pages/BasePage.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'

test.describe('ФТ-8: Connection status', () => {
  test('по умолчанию «ПОДКЛЮЧЕНО»', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/')
    const base = new BasePage(page)
    await expect(base.connectionStatus).toContainText('ПОДКЛЮЧЕНО')
    await expect(base.connectionStatus).toHaveAttribute('data-state', 'connected')
  })

  test('при принудительном disconnect отображается «НЕТ СВЯЗИ»', async ({ page, loginAs }) => {
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
    await expect(base.connectionStatus).toHaveAttribute('data-state', 'disconnected')
  })

  test('после восстановления статус снова «ПОДКЛЮЧЕНО»', async ({ page, loginAs }) => {
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
