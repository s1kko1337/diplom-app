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
    return this.page.getByRole('button', { name: /Выполнено/ })
  }

  get markFailedButton() {
    return this.page.getByRole('button', { name: /С замечаниями/ })
  }

  get markSkippedButton() {
    return this.page.getByRole('button', { name: /Пропустить/ })
  }

  get finishButton() {
    return this.page.getByRole('button', { name: /Завершить работу/ })
  }

  get submitForReviewButton() {
    return this.page.getByRole('button', { name: /Отправить на приёмку/ })
  }

  get approveButton() {
    return this.page.getByRole('button', { name: /Принять/ })
  }

  get rejectButton() {
    return this.page.getByRole('button', { name: /Отклонить/ })
  }

  measurementInput(label) {
    return this.page.getByLabel(new RegExp(label))
  }
}
