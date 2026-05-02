import { test, expect } from '../fixtures/index.js'
import { LoginPage } from '../pages/LoginPage.js'

test.describe('НФТ-9: кросс-браузер smoke', () => {
  test('логин через UI и переход на главную', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.loginUI('engineer')
    await expect(page).toHaveURL(/\/$/)
  })

  test('список оборудования рендерится', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/equipment')
    const cards = page.getByTestId('equipment-card')
    await expect(cards.first()).toBeVisible()
  })
})
