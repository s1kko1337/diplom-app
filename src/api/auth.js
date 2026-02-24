import { request } from './client'

const MOCK_USER = {
  id: 1,
  name: 'Администратор',
  role: 'admin',
  email: 'admin@rudgormash.ru',
}

export function login(credentials) {
  return request(() => {
    if (!credentials.username || !credentials.password) {
      throw new Error('Введите логин и пароль')
    }
    return {
      token: 'mock-jwt-' + Date.now(),
      user: MOCK_USER,
    }
  })
}

export function logout() {
  return request(() => ({ success: true }))
}

export function getMe() {
  return request(() => MOCK_USER)
}
