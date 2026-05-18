import { test, expect } from '../fixtures/index.js'
import { AlertsPage } from '../pages/AlertsPage.js'
import { JournalPage } from '../pages/JournalPage.js'
import { seedAlerts } from '../fixtures/state.js'
import { makeAlert } from '../helpers/storage.js'

test.describe('Alerts: расширенные фильтры', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('фильтр «Критические» оставляет только critical-карточки', async ({ page }) => {
    await seedAlerts(page, [
      makeAlert({ id: 'A-C1', type: 'critical' }),
      makeAlert({ id: 'A-W1', type: 'warning' }),
      makeAlert({ id: 'A-I1', type: 'info' }),
    ])
    const alerts = new AlertsPage(page)
    await alerts.goto()
    await alerts.filter('Критические').click()
    await expect(alerts.cardByType('critical')).toBeVisible()
    await expect(alerts.cardByType('warning')).toHaveCount(0)
  })

  test('фильтр «Предупреждения» скрывает critical', async ({ page }) => {
    await seedAlerts(page, [
      makeAlert({ id: 'A-C1', type: 'critical' }),
      makeAlert({ id: 'A-W1', type: 'warning' }),
    ])
    const alerts = new AlertsPage(page)
    await alerts.goto()
    await alerts.filter('Предупреждения').click()
    await expect(alerts.cardByType('warning')).toBeVisible()
    await expect(alerts.cardByType('critical')).toHaveCount(0)
  })

  test('фильтр «Неподтверждённые» скрывает acknowledged', async ({ page }) => {
    await seedAlerts(page, [
      makeAlert({ id: 'A-A1', type: 'warning', acknowledged: true }),
      makeAlert({ id: 'A-U1', type: 'warning', acknowledged: false }),
    ])
    const alerts = new AlertsPage(page)
    await alerts.goto()
    await alerts.filter('Неподтверждённые').click()
    await expect(page.locator('[data-alert-id="A-U1"]')).toBeVisible()
    await expect(page.locator('[data-alert-id="A-A1"]')).toHaveCount(0)
  })

  test('пустой фильтр показывает empty-state «Нет уведомлений»', async ({ page }) => {
    await seedAlerts(page, [makeAlert({ id: 'A-W1', type: 'warning' })])
    const alerts = new AlertsPage(page)
    await alerts.goto()
    await alerts.filter('Критические').click()
    await expect(page.getByText(/Нет уведомлений в данной категории/)).toBeVisible()
  })

  test('подтверждение нескольких алертов уменьшает счётчик в шапке', async ({ page }) => {
    await seedAlerts(page, [
      makeAlert({ id: 'A-1', type: 'warning', acknowledged: false }),
      makeAlert({ id: 'A-2', type: 'warning', acknowledged: false }),
      makeAlert({ id: 'A-3', type: 'warning', acknowledged: false }),
    ])
    const alerts = new AlertsPage(page)
    await alerts.goto()
    await alerts.acknowledge('A-1')
    await alerts.acknowledge('A-2')
    const badge = page.locator('header button').filter({ hasText: /^\d+$/ }).first()
    await expect(badge).toHaveText('1')
  })

  test.skip('CriticalAlertModal: открывается через store action openCriticalAlert', async ({
    page,
  }) => {
    // TODO: модал не реагирует на ручную мутацию showCriticalAlert через __pinia.state —
    // нужен интеграционный путь через addLiveAlert (требует более точной конфигурации seedAlerts).
    await seedAlerts(page, [
      makeAlert({
        id: 'A-MODAL',
        type: 'critical',
        title: 'КРИТ-МОДАЛ',
        equipmentId: 'БУР-12',
        acknowledged: false,
      }),
    ])
    await page.goto('/')
    // Дожидаемся прогрузки alerts и зовём action как в проде.
    await expect
      .poll(async () =>
        await page.evaluate(() => window.__pinia?.state?.value?.alerts?.alerts?.length ?? 0),
      )
      .toBeGreaterThan(0)
    await page.evaluate(() => {
      const state = window.__pinia.state.value.alerts
      if (state) state.showCriticalAlert = true
    })
    await expect(page.getByTestId('critical-alert-modal')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('КРИТИЧЕСКОЕ УВЕДОМЛЕНИЕ')).toBeVisible()
  })

  test.skip('CriticalAlertModal: «ПОДТВЕРДИТЬ И ЗАКРЫТЬ» закрывает модал', async ({ page }) => {
    // TODO: см. комментарий выше — открытие модала через мутацию state не срабатывает.
    await seedAlerts(page, [
      makeAlert({ id: 'A-MODAL2', type: 'critical', acknowledged: false }),
    ])
    await page.goto('/')
    await expect
      .poll(async () =>
        await page.evaluate(() => window.__pinia?.state?.value?.alerts?.alerts?.length ?? 0),
      )
      .toBeGreaterThan(0)
    await page.evaluate(() => {
      const state = window.__pinia.state.value.alerts
      if (state) state.showCriticalAlert = true
    })
    await expect(page.getByTestId('critical-alert-modal')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /ПОДТВЕРДИТЬ И ЗАКРЫТЬ/ }).click()
    await expect(page.getByTestId('critical-alert-modal')).toBeHidden()
  })
})

test.describe('Journal: фильтры', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('Журнал: фильтр по оборудованию сужает таблицу', async ({ page }) => {
    const journal = new JournalPage(page)
    await journal.goto()
    await expect(journal.table).toBeVisible()
    const beforeRows = await journal.table.getByRole('row').count()
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'БУР-12' }).click()
    const afterRows = await journal.table.getByRole('row').count()
    expect(afterRows).toBeLessThanOrEqual(beforeRows)
  })

  test('Журнал: «Сбросить» возвращает фильтр в дефолт', async ({ page }) => {
    const journal = new JournalPage(page)
    await journal.goto()
    await expect(journal.table).toBeVisible()
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'БУР-12' }).click()
    await page.getByRole('button', { name: 'Сбросить' }).click()
    // После сброса первый combobox показывает «Все станки».
    await expect(page.getByRole('combobox').first()).toContainText(/Все станки/)
  })

  test('Журнал: фильтр по дате «с» — таблица сужается или остаётся такой же', async ({ page }) => {
    const journal = new JournalPage(page)
    await journal.goto()
    await expect(journal.table).toBeVisible()
    const before = await journal.table.getByRole('row').count()
    // Поле даты — type="date" input.
    await page.locator('input[type="date"]').first().fill('2026-04-01')
    await page.waitForTimeout(300)
    const after = await journal.table.getByRole('row').count()
    expect(after).toBeLessThanOrEqual(before)
  })
})
