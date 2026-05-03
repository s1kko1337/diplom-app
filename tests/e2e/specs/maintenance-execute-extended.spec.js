import { test, expect } from '../fixtures/index.js'
import { MaintenanceDetailPage } from '../pages/MaintenanceDetailPage.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

const MECHANIC = { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' }

async function readOrder(page, id) {
  return await page.evaluate((orderId) => {
    const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
    return orders.find((o) => o.id === orderId)
  }, id)
}

test.describe('Maintenance execute (extended)', () => {
  test('mechanic: planned-наряд требует «Начать выполнение»', async ({ page, loginAs }) => {
    const order = makeOrder({ id: 'ORD-EX-1', status: 'planned', assignedTo: MECHANIC })
    await seedOrders(page, [order])
    await loginAs('mechanic')
    await new MaintenanceDetailPage(page, 'ORD-EX-1').goto()
    await expect(page.getByRole('button', { name: /Начать выполнение/ })).toBeVisible()
    await expect(page.getByText('Шаг 1', { exact: true })).toHaveCount(0)
  })

  test('mechanic: после «Начать» статус наряда → in_progress, появляется wizard', async ({
    page,
    loginAs,
  }) => {
    const order = makeOrder({ id: 'ORD-EX-2', status: 'planned', assignedTo: MECHANIC })
    await seedOrders(page, [order])
    await loginAs('mechanic')
    await new MaintenanceDetailPage(page, 'ORD-EX-2').goto()
    await page.getByRole('button', { name: /Начать выполнение/ }).click()
    await expect(page.getByText('Шаг 1', { exact: true }).first()).toBeVisible()
    const o = await readOrder(page, 'ORD-EX-2')
    expect(o.status).toBe('in_progress')
  })

  test('mechanic: «С замечаниями» переводит шаг в failed с обязательным комментарием', async ({
    page,
    loginAs,
  }) => {
    const order = makeOrder({ id: 'ORD-EX-3', status: 'in_progress', assignedTo: MECHANIC })
    order.steps[0].status = 'in_progress'
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-EX-3')
    await detail.goto()
    await page.getByRole('textbox').first().fill('Резьба сорвана, требуется замена')
    await detail.markFailedButton.first().click()
    await expect
      .poll(async () => (await readOrder(page, 'ORD-EX-3')).steps[0].status)
      .toBe('failed')
    const o = await readOrder(page, 'ORD-EX-3')
    expect(o.steps[0].comment).toContain('Резьба')
  })

  test('mechanic: «Пропустить» переводит шаг в skipped', async ({ page, loginAs }) => {
    const order = makeOrder({ id: 'ORD-EX-4', status: 'in_progress', assignedTo: MECHANIC })
    order.steps[0].status = 'in_progress'
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-EX-4')
    await detail.goto()
    await detail.markSkippedButton.first().click()
    await expect
      .poll(async () => (await readOrder(page, 'ORD-EX-4')).steps[0].status)
      .toBe('skipped')
  })

  test('mechanic: навигация «Далее»/«Назад» между шагами', async ({ page, loginAs }) => {
    const order = makeOrder({ id: 'ORD-EX-5', status: 'in_progress', assignedTo: MECHANIC })
    order.steps[0].status = 'passed'
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-EX-5')
    await detail.goto()
    // Прогресс-бар начинает со второго шага (первый passed). Идём «Назад» к первому.
    await page.getByRole('button', { name: /^← Назад/ }).click()
    await expect(page.getByText('Шаг 1', { exact: true }).first()).toBeVisible()
    await page.getByRole('button', { name: /Далее →/ }).click()
    await expect(page.getByText('Шаг 2', { exact: true }).first()).toBeVisible()
  })

  test('engineer: видит кнопку «Отменить наряд» (в отличие от mechanic)', async ({
    page,
    loginAs,
  }) => {
    const order = makeOrder({ id: 'ORD-EX-6', status: 'planned', assignedTo: MECHANIC })
    await seedOrders(page, [order])
    await loginAs('engineer')
    await new MaintenanceDetailPage(page, 'ORD-EX-6').goto()
    await expect(page.getByRole('button', { name: /Отменить наряд/ })).toBeVisible()
  })

  test('engineer: «Отменить наряд» → статус cancelled', async ({ page, loginAs }) => {
    const order = makeOrder({ id: 'ORD-EX-7', status: 'in_progress', assignedTo: MECHANIC })
    await seedOrders(page, [order])
    await loginAs('engineer')
    await new MaintenanceDetailPage(page, 'ORD-EX-7').goto()
    await page.getByRole('button', { name: /Отменить наряд/ }).click()
    // Возможно появляется dialog подтверждения.
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dialog
        .getByRole('button', { name: /Отменить$|Подтвердить|Да/ })
        .first()
        .click()
    }
    await expect
      .poll(async () => (await readOrder(page, 'ORD-EX-7'))?.status)
      .toBe('cancelled')
  })

  test('foreman: review-наряд видит OrderSummary с подсчётом шагов', async ({ page, loginAs }) => {
    const order = makeOrder({ id: 'ORD-EX-8', status: 'review', assignedTo: MECHANIC })
    order.steps[0].status = 'passed'
    order.steps[1].status = 'failed'
    order.steps[2].status = 'skipped'
    await seedOrders(page, [order])
    await loginAs('foreman')
    await new MaintenanceDetailPage(page, 'ORD-EX-8').goto()
    // OrderSummary показывает агрегированную информацию о шагах.
    await expect(page.getByText(/passed|Выполнено|пройдено/i).first()).toBeVisible()
  })

  test('non-assigned mechanic: чужой наряд → readonly, нет кнопок действий', async ({
    page,
    loginAs,
  }) => {
    const order = makeOrder({
      id: 'ORD-EX-9',
      status: 'in_progress',
      assignedTo: { id: 'user-3', name: 'Сидоров К.М.', role: 'mechanic' },
    })
    await seedOrders(page, [order])
    await loginAs('mechanic') // user-2, не назначен
    await new MaintenanceDetailPage(page, 'ORD-EX-9').goto()
    // Нет кнопок выполнения шагов.
    await expect(page.getByRole('button', { name: /Выполнено/ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /С замечаниями/ })).toHaveCount(0)
  })

  test('multi-step (5 шагов): прогресс-бар отображает все шаги', async ({ page, loginAs }) => {
    const order = makeOrder({ id: 'ORD-EX-10', status: 'in_progress', assignedTo: MECHANIC })
    // Дополним до 5 шагов.
    order.steps = [
      ...order.steps,
      { id: 's-4', title: 'Тест 4', description: 'Шаг 4', status: 'pending', measurements: [], materials: [] },
      { id: 's-5', title: 'Тест 5', description: 'Шаг 5', status: 'pending', measurements: [], materials: [] },
    ]
    await seedOrders(page, [order])
    await loginAs('mechanic')
    await new MaintenanceDetailPage(page, 'ORD-EX-10').goto()
    // Главное — текст «Шаг 1» виден на текущей карточке.
    await expect(page.getByText('Шаг 1', { exact: true }).first()).toBeVisible()
    // Проходим вперёд до 5-го шага.
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /Далее →/ }).click()
    }
    await expect(page.getByText('Шаг 5', { exact: true }).first()).toBeVisible()
  })
})
