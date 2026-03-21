import { request } from './client'
import { MOCK_USERS } from './mock/users'

let currentUser = null

export function login(credentials) {
  return request(() => {
    if (!credentials.username || !credentials.password) {
      throw new Error('Введите логин и пароль')
    }
    const role = credentials.role || 'engineer'
    const user = MOCK_USERS.find((u) => u.role === role)
    if (!user) throw new Error('Роль не найдена')
    currentUser = { ...user }
    return {
      token: 'mock-jwt-' + Date.now(),
      user: currentUser,
    }
  })
}

export function logout() {
  return request(() => {
    currentUser = null
    return { success: true }
  })
}

export function getMe() {
  return request(() => {
    if (!currentUser) {
      currentUser = { ...MOCK_USERS[0] }
    }
    return currentUser
  })
}
