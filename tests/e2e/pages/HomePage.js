export class HomePage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/')
  }

  get heading() {
    return this.page.getByRole('heading', { name: 'Обзор системы' })
  }

  get assignedOrdersCard() {
    return this.page.getByText('Мои наряды')
  }

  get reviewQueueCard() {
    return this.page.getByText('На приёмке')
  }
}
