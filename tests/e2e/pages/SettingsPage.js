export class SettingsPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/settings')
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /СОХРАНИТЬ/i })
  }

  get resetButton() {
    return this.page.getByRole('button', { name: /СБРОСИТЬ/i })
  }

  get successBanner() {
    return this.page.getByText('НАСТРОЙКИ СОХРАНЕНЫ')
  }
}
