export class MaintenanceDetailPage {
  constructor(page, id) {
    this.page = page
    this.id = id
  }

  async goto() {
    await this.page.goto(`/maintenance/${this.id}`)
  }

  get currentStepCard() {
    return this.page.locator('[data-step-card]').first()
  }

  get nextStepButton() {
    return this.page.getByRole('button', { name: /Далее/ })
  }

  get markPassedButton() {
    return this.page.getByRole('button', { name: 'Выполнено', exact: true })
  }

  get markFailedButton() {
    return this.page.getByRole('button', { name: 'Не выполнено', exact: true })
  }

  get markSkippedButton() {
    return this.page.getByRole('button', { name: 'Пропущено', exact: true })
  }

  get finishButton() {
    return this.page.getByRole('button', { name: /Завершить работу/ })
  }

  get submitForReviewButton() {
    return this.page.getByRole('button', { name: /Отправить на приёмку/ })
  }

  get approveButton() {
    return this.page.getByRole('button', { name: /Утвердить/ })
  }

  get returnButton() {
    return this.page.getByRole('button', { name: /Вернуть на доработку/ })
  }

  measurementInput(label) {
    return this.page.getByLabel(new RegExp(label))
  }
}
