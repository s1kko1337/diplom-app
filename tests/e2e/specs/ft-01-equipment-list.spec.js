import { test, expect } from '../fixtures/index.js'
import { EquipmentListPage } from '../pages/EquipmentListPage.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'
import { STATUS_LABELS } from '../helpers/selectors.js'

test.describe('ФТ-1: Перечень оборудования', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('список содержит 8 карточек со статусом', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await expect(list.cards).toHaveCount(8)
    for (const status of ['working', 'idle', 'malfunction', 'offline']) {
      const cards = page.locator(`[data-testid="equipment-card"][data-status="${status}"]`)
      const count = await cards.count()
      if (count > 0) {
        await expect(cards.first()).toContainText(STATUS_LABELS[status])
      }
    }
  })

  test('фильтр по табу «Авария» оставляет только malfunction', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await list.tabByName('Авария').click()
    const visible = await list.cards.count()
    const malfunction = await page.locator('[data-status="malfunction"]').count()
    expect(visible).toBe(malfunction)
  })

  test('поиск «БУР-03» сужает список до одной карточки', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await list.searchInput.fill('БУР-03')
    await expect(list.cards).toHaveCount(1)
    await expect(list.cardById('БУР-03')).toBeVisible()
  })

  test('клик по карточке открывает детальную страницу с 5 табами', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await list.openCard('БУР-12')
    await expect(page).toHaveURL(/\/equipment\/[^/]+$/)
    const detail = new EquipmentDetailPage(page, 'БУР-12')
    for (const t of ['Обзор', 'Датчики', 'ТО', 'Детали', 'История']) {
      await expect(detail.tab(t)).toBeVisible()
    }
  })
})
