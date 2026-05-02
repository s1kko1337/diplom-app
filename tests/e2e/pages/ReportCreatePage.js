export class ReportCreatePage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/reports/create')
  }
}
