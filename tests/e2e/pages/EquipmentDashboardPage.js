import { TESTIDS } from '../helpers/selectors.js'

export class EquipmentDashboardPage {
  constructor(page, id) {
    this.page = page
    this.id = id
  }

  async goto() {
    await this.page.goto(`/equipment/${this.id}/dashboard`)
  }

  get configureButton() {
    return this.page.getByRole('button', { name: 'Настроить' })
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Сохранить' })
  }

  get addWidgetButton() {
    return this.page.getByRole('button', { name: 'Виджет' })
  }

  get resetButton() {
    return this.page.getByRole('button', { name: 'Сброс' })
  }

  get widgets() {
    return this.page.getByTestId(TESTIDS.widgetCard)
  }

  widgetByType(type) {
    return this.page.locator(`[data-testid="widget-card"][data-widget-type="${type}"]`)
  }

  async addWidget(typeLabel, sensorLabel) {
    await this.addWidgetButton.click()
    await this.page.getByRole('button', { name: typeLabel }).click()
    if (sensorLabel) {
      await this.page.getByRole('button', { name: sensorLabel }).click()
    }
    await this.page.getByRole('button', { name: 'ДОБАВИТЬ' }).click()
  }

  async removeFirstWidget() {
    const count = await this.widgets.count()
    await this.widgets.first().getByRole('button').last().click()
    return count
  }
}
