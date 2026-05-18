import { TESTIDS } from '../helpers/selectors.js'

export class EquipmentListPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/equipment')
  }

  get cards() {
    return this.page.getByTestId(TESTIDS.equipmentCard)
  }

  cardById(id) {
    return this.page.locator(`[data-testid="equipment-card"][data-equipment-id="${id}"]`)
  }

  get searchInput() {
    return this.page.getByPlaceholder(/Поиск/)
  }

  tabByName(name) {
    return this.page.getByRole('tab', { name: new RegExp(name) })
  }

  async openCard(id) {
    await this.cardById(id).getByRole('link').first().click()
  }
}
