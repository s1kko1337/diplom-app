import { test, expect } from '../fixtures/index.js'
import { JournalPage } from '../pages/JournalPage.js'

test.describe('ФТ-12: Журнал', () => {
  test('engineer открывает /journal и видит таблицу', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const journal = new JournalPage(page)
    await journal.goto()
    await expect(journal.table).toBeVisible({ timeout: 10_000 })
  })
})
