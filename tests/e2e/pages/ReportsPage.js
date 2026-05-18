export class ReportsPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/reports')
  }

  get heading() {
    return this.page.getByRole('heading', { name: 'Отчёты' })
  }

  get createButton() {
    return this.page.getByRole('button', { name: /Создать отчёт/ })
  }
}
