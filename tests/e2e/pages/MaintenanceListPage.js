export class MaintenanceListPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/maintenance')
  }

  get createButton() {
    return this.page.getByRole('button', { name: /Создать наряд/ })
  }

  column(label) {
    return this.page
      .locator('section, div')
      .filter({
        has: this.page.getByRole('heading', { name: label, level: 3 }),
      })
      .first()
  }

  cardByEquipment(equipmentId) {
    return this.page.locator('div', { hasText: equipmentId }).first()
  }
}
