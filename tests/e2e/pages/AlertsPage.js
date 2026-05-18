import { TESTIDS } from '../helpers/selectors.js'

export class AlertsPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/alerts')
  }

  get cards() {
    return this.page.getByTestId(TESTIDS.alertCard)
  }

  cardByType(type) {
    return this.page.locator(`[data-testid="alert-card"][data-alert-type="${type}"]`)
  }

  unacknowledged() {
    return this.page.locator('[data-testid="alert-card"][data-alert-acknowledged="0"]')
  }

  async acknowledge(alertId) {
    const card = this.page.locator(`[data-testid="alert-card"][data-alert-id="${alertId}"]`)
    await card.getByRole('button', { name: 'Подтвердить' }).click()
  }

  filter(name) {
    return this.page.getByRole('tab', { name: new RegExp(name) })
  }
}
