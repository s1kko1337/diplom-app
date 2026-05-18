import { test, expect } from '../fixtures/index.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'

test.describe('ФТ-7: Realtime polling', () => {
  test('liveData в Pinia пополняется при открытии станка', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const detail = new EquipmentDetailPage(page, 'БУР-12')
    await detail.goto()
    await expect
      .poll(
        async () => {
          return await page.evaluate(() => {
            const sensors = window.__pinia?.state?.value?.sensors
            return sensors?.liveData?.['БУР-12']?.['temp-engine']?.value ?? null
          })
        },
        { timeout: 10_000 },
      )
      .not.toBeNull()
  })

  test('polling останавливается при уходе со страницы', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const detail = new EquipmentDetailPage(page, 'БУР-12')
    await detail.goto()
    await expect
      .poll(async () => {
        return await page.evaluate(() => window.__pinia?.state?.value?.sensors?.pollingActive)
      })
      .toBe(true)
    await page.goto('/')
    await expect
      .poll(async () => {
        return await page.evaluate(() => window.__pinia?.state?.value?.sensors?.pollingActive)
      })
      .toBe(false)
  })
})
