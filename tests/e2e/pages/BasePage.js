import { TESTIDS, NAV_LINKS } from '../helpers/selectors.js'

export class BasePage {
  constructor(page) {
    this.page = page
  }

  get connectionStatus() {
    return this.page.getByTestId(TESTIDS.connectionStatus)
  }

  get alertsBadge() {
    return this.page.getByRole('button', { name: 'Уведомления' }).locator('span').last()
  }

  get sidebar() {
    return this.page.locator('aside, [role="dialog"][data-state="open"]').first()
  }

  navLink(name) {
    return this.page.getByRole('link', { name }).first()
  }

  async goToNav(key) {
    const label = NAV_LINKS[key]
    await this.navLink(label).click()
  }

  async expectStatus(state) {
    const map = {
      connected: 'ПОДКЛЮЧЕНО',
      reconnecting: 'ПЕРЕПОДКЛЮЧЕНИЕ',
      disconnected: 'НЕТ СВЯЗИ',
    }
    await this.connectionStatus.getByText(map[state]).waitFor()
  }
}
