import { ROLES } from '../helpers/selectors.js'

export class LoginPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/login')
  }

  get userSelect() {
    return this.page.getByRole('combobox')
  }

  get passwordInput() {
    return this.page.getByLabel('Пароль')
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Войти' })
  }

  get errorBanner() {
    return this.page.locator('.text-destructive').first()
  }

  async loginUI(role) {
    const user = ROLES[role]
    await this.userSelect.click()
    await this.page.getByRole('option', { name: new RegExp(user.name) }).click()
    await this.passwordInput.fill('test')
    await this.submitButton.click()
  }
}
