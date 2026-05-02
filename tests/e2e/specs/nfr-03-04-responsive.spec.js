import { test, expect } from '../fixtures/index.js'
import { VIEWPORTS } from '../helpers/viewport.js'
import { seedAlerts } from '../fixtures/state.js'
import { makeAlert } from '../helpers/storage.js'

test.describe('НФТ-3, НФТ-4: адаптив и touch', () => {
  for (const [name, vp] of Object.entries(VIEWPORTS)) {
    test(`${name}: основные экраны без горизонтального overflow`, async ({ page, loginAs }) => {
      await loginAs('engineer')
      await page.setViewportSize(vp)
      for (const path of ['/', '/equipment', '/alerts', '/maintenance']) {
        await page.goto(path)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow).toBeLessThanOrEqual(2)
      }
    })
  }

  test('mobile: кнопка «Подтвердить» в уведомлениях ≥ 44 px', async ({ page, loginAs }) => {
    await seedAlerts(page, [
      makeAlert({ id: 'A-MOBILE', type: 'warning', acknowledged: false }),
    ])
    await loginAs('engineer')
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto('/alerts')
    const ackBtn = page.getByRole('button', { name: 'Подтвердить' }).first()
    const box = await ackBtn.boundingBox()
    expect(box.height).toBeGreaterThanOrEqual(44)
  })
})
