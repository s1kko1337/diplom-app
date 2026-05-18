import { ROLES } from '../helpers/selectors.js'

export async function injectAuthToStorage(page, role) {
  const user = ROLES[role]
  if (!user) throw new Error(`Unknown role: ${role}`)
  await page.addInitScript(({ id, token }) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user_id', id)
    localStorage.setItem('rgm:migrated-legacy', '1')
  }, { id: user.id, token: 'mock-jwt-test-' + user.id })
  return user
}

export async function loginViaUI(page, role = 'engineer') {
  const user = ROLES[role]
  await page.goto('/login')
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: new RegExp(user.name) }).click()
  await page.getByLabel('Пароль').fill('test')
  await page.getByRole('button', { name: 'Войти' }).click()
  await page.waitForURL('**/')
}
