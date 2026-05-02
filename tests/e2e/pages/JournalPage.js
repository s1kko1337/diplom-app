export class JournalPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/journal')
  }

  get table() {
    return this.page.getByRole('table')
  }
}
