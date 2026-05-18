export class MaintenanceCreatePage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/maintenance/create')
  }

  get nextButton() {
    return this.page.getByRole('button', { name: 'Далее' })
  }

  get backButton() {
    return this.page.getByRole('button', { name: 'Назад' })
  }

  get createButton() {
    return this.page.getByRole('button', { name: /Создать наряд/ })
  }

  async pickEquipment(equipmentId) {
    await this.page.getByRole('button', { name: new RegExp(equipmentId) }).click()
  }

  async pickType(typeLabel) {
    await this.page.getByRole('button', { name: typeLabel }).click()
  }

  async pickAssignee(name) {
    await this.page.getByRole('combobox').click()
    await this.page.getByRole('option', { name: new RegExp(name) }).click()
  }
}
