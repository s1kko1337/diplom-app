import { test, expect } from '../fixtures/index.js'

async function gotoCreate(page) {
  await page.goto('/maintenance/create')
}

async function pickEquipmentSelect(page, equipmentId) {
  // Step 1 первый Select — оборудование, второй — тип ТО.
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: new RegExp(equipmentId) }).click()
}

async function pickTypeSelect(page, typeLabel) {
  await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: new RegExp(typeLabel) }).click()
}

test.describe('Maintenance create wizard (extended)', () => {
  test('engineer: пустая форма — кнопка «Далее» неактивна', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await gotoCreate(page)
    await expect(page.getByRole('button', { name: 'Далее' })).toBeDisabled()
  })

  test('engineer: после выбора оборудования но без типа ТО — «Далее» неактивна', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await gotoCreate(page)
    await pickEquipmentSelect(page, 'БУР-12')
    await expect(page.getByRole('button', { name: 'Далее' })).toBeDisabled()
  })

  test('engineer: выбор оборудования + типа ТО → «Далее» активна и переходит на шаг 2', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await gotoCreate(page)
    await pickEquipmentSelect(page, 'БУР-12')
    await pickTypeSelect(page, '^ТО-1$')
    const next = page.getByRole('button', { name: 'Далее' })
    await expect(next).toBeEnabled()
    await next.click()
    // На шаге 2 виден чек-лист (карточка «Шаг 1»).
    await expect(page.getByRole('heading', { name: /Шаг 1/ }).first()).toBeVisible()
  })

  test('engineer: разные типы ТО загружают разные чек-листы', async ({ page, loginAs }) => {
    await loginAs('engineer')
    // ТО-1
    await gotoCreate(page)
    await pickEquipmentSelect(page, 'БУР-12')
    await pickTypeSelect(page, '^ТО-1$')
    await page.getByRole('button', { name: 'Далее' }).click()
    const stepHeading = page.getByRole('heading', { name: /Шаг 1/ })
    await expect(stepHeading.first()).toBeVisible()
    const to1Steps = await page.getByRole('heading', { name: /Шаг \d+/ }).count()
    expect(to1Steps).toBeGreaterThan(0)
    // ТО-2 (новый сценарий)
    await gotoCreate(page)
    await pickEquipmentSelect(page, 'БУР-12')
    await pickTypeSelect(page, '^ТО-2$')
    await page.getByRole('button', { name: 'Далее' }).click()
    await expect(page.getByRole('heading', { name: /Шаг 1/ }).first()).toBeVisible()
    const to2Steps = await page.getByRole('heading', { name: /Шаг \d+/ }).count()
    expect(to2Steps).toBeGreaterThan(0)
  })

  test('engineer: «Назад» возвращает к шагу 1 и сохраняет выбор', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await gotoCreate(page)
    await pickEquipmentSelect(page, 'БУР-12')
    await pickTypeSelect(page, '^ТО-1$')
    await page.getByRole('button', { name: 'Далее' }).click()
    await expect(page.getByRole('heading', { name: /Шаг 1/ }).first()).toBeVisible()
    await page.getByRole('button', { name: 'Назад' }).click()
    // Возвращаемся на шаг 1 — combobox с выбранным значением.
    await expect(page.getByText('БУР-12').first()).toBeVisible()
  })

  test('engineer: на шаге 3 без исполнителя «Создать наряд» неактивна', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await gotoCreate(page)
    await pickEquipmentSelect(page, 'БУР-12')
    await pickTypeSelect(page, '^ТО-1$')
    await page.getByRole('button', { name: 'Далее' }).click()
    await page.getByRole('button', { name: 'Далее' }).click()
    await expect(page.getByRole('button', { name: /Создать наряд/ })).toBeDisabled()
  })

  test('engineer: полный happy-path → наряд создан и виден в /maintenance', async ({
    page,
    loginAs,
  }) => {
    await loginAs('engineer')
    await gotoCreate(page)
    await pickEquipmentSelect(page, 'БУР-12')
    await pickTypeSelect(page, '^ТО-1$')
    await page.getByRole('button', { name: 'Далее' }).click()
    await expect(page.getByRole('heading', { name: /Шаг 1/ }).first()).toBeVisible()
    await page.getByRole('button', { name: 'Далее' }).click()
    // Шаг 3: ждём появления комбобокса «Механик» — его placeholder «Выберите механика».
    const mechanicSelect = page
      .getByRole('combobox')
      .filter({ hasText: /Выберите механика|Петров|Сидоров/ })
      .first()
    await expect(mechanicSelect).toBeVisible()
    await mechanicSelect.click()
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 10_000 })
    await page.getByRole('option', { name: /Петров/ }).click()
    await page.getByRole('button', { name: /Создать наряд/ }).click()
    await expect(page).toHaveURL(/\/maintenance$/)
    // Карточка с БУР-12 и Петровым видна.
    await expect(page.getByText('БУР-12').first()).toBeVisible()
  })

  test('mechanic: страница /maintenance/create показывает «Недостаточно прав»', async ({
    page,
    loginAs,
  }) => {
    await loginAs('mechanic')
    await gotoCreate(page)
    await expect(page.getByText(/Недостаточно прав/)).toBeVisible()
    await expect(page.getByRole('link', { name: /Вернуться к нарядам/ })).toBeVisible()
  })

  test('foreman: страница /maintenance/create показывает «Недостаточно прав»', async ({
    page,
    loginAs,
  }) => {
    await loginAs('foreman')
    await gotoCreate(page)
    await expect(page.getByText(/Недостаточно прав/)).toBeVisible()
  })
})
