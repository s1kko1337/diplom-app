export class EquipmentDetailPage {
  constructor(page, id) {
    this.page = page
    this.id = id
  }

  async goto() {
    await this.page.goto(`/equipment/${this.id}`)
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
