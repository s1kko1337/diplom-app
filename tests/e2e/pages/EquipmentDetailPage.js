export class EquipmentDetailPage {
  constructor(page, id) {
    this.page = page
    this.id = id
  }

  async goto() {
    await this.page.goto('/equipment')
    await this.page
      .locator(`[data-testid="equipment-card"][data-equipment-id="${this.id}"]`)
      .getByRole('link')
      .first()
      .click()
    await this.page.waitForURL(/\/equipment\/[^/]+$/)
  }

  tab(name) {
    return this.page.getByRole('tab', { name, exact: true })
  }

  async openTab(name) {
    await this.tab(name).click()
  }

  get sensorsTable() {
    return this.page.getByRole('table')
  }
}
