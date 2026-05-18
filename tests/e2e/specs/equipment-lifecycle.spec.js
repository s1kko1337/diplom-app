import { test, expect } from '../fixtures/index.js'
import { EquipmentListPage } from '../pages/EquipmentListPage.js'

test.describe('Equipment lifecycle (create / disconnect / reconnect / delete)', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('диалог создания станка: валидация ID и заполнение формы', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await page.getByRole('button', { name: /Подключить станок/ }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Подключить новый станок')).toBeVisible()
    // Без ID submit отправляется но HTML5 required не пропустит — проверяем визуально:
    await dialog.getByRole('button', { name: /^Подключить$/ }).click()
    // Диалог остаётся открытым (ID был пуст).
    await expect(dialog).toBeVisible()
  })

  test('создание нового станка добавляет карточку в список', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await expect(list.cards.first()).toBeVisible()
    const initial = await list.cards.count()
    await page.getByRole('button', { name: /Подключить станок/ }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('БУР-99').fill('БУР-TEST')
    await dialog.getByPlaceholder('СБШ-250МНА').fill('TEST-MODEL')
    await dialog.getByRole('button', { name: /^Подключить$/ }).click()
    await expect(dialog).toBeHidden()
    await expect(list.cards).toHaveCount(initial + 1)
    await expect(list.cardById('БУР-TEST')).toBeVisible()
  })

  test('отключение станка переводит его в статус offline', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    const card = list.cardById('БУР-12')
    await expect(card).toHaveAttribute('data-status', 'working')
    await card.getByRole('button', { name: /Отключить/ }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Отключить станок')).toBeVisible()
    await dialog.getByRole('button', { name: /^Отключить$/ }).click()
    await expect(dialog).toBeHidden()
    await expect(card).toHaveAttribute('data-status', 'offline')
  })

  test('подключение offline-станка возвращает его в idle', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    // БУР-05 — изначально offline в сиде.
    const card = list.cardById('БУР-05')
    await expect(card).toHaveAttribute('data-status', 'offline')
    await card.getByRole('button', { name: /Подключить/ }).click()
    await expect(card).toHaveAttribute('data-status', 'idle')
  })

  test('удаление станка: подтверждение → карточка исчезает', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await expect(list.cards.first()).toBeVisible()
    const initial = await list.cards.count()
    const card = list.cardById('БУР-19')
    await card.getByRole('button', { name: /Удалить/ }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Удалить станок')).toBeVisible()
    await dialog.getByRole('button', { name: /Удалить безвозвратно/ }).click()
    await expect(dialog).toBeHidden()
    await expect(list.cards).toHaveCount(initial - 1)
    await expect(list.cardById('БУР-19')).toHaveCount(0)
  })

  test('отмена удаления: диалог закрывается без изменений', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await expect(list.cards.first()).toBeVisible()
    const initial = await list.cards.count()
    const card = list.cardById('БУР-12')
    await card.getByRole('button', { name: /Удалить/ }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Отмена' }).click()
    await expect(dialog).toBeHidden()
    await expect(list.cards).toHaveCount(initial)
    await expect(list.cardById('БУР-12')).toBeVisible()
  })

  test('счётчик «АКТИВНО» обновляется после disconnect', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    const counter = page.getByText('АКТИВНО').locator('..').locator('.metric-value').first()
    const before = await counter.textContent()
    const [working] = before.trim().split('/')
    const beforeNum = Number(working)
    const card = list.cardById('БУР-12')
    await card.getByRole('button', { name: /Отключить/ }).click()
    await page.getByRole('dialog').getByRole('button', { name: /^Отключить$/ }).click()
    await expect.poll(async () => {
      const txt = await counter.textContent()
      return Number(txt.trim().split('/')[0])
    }).toBe(beforeNum - 1)
  })

  test('фильтр «Отключён»: содержит как минимум сидированный БУР-05', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await list.tabByName('Отключён').click()
    await expect(list.cardById('БУР-05')).toBeVisible()
    const cards = await list.cards.count()
    expect(cards).toBeGreaterThanOrEqual(1)
  })
})
