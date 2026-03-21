import { request } from './client'
import { MOCK_USERS } from './mock/users'

const USER_KEY = 'auth_user_id'
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
    localStorage.setItem(USER_KEY, currentUser.id)
    return {
      token: 'mock-jwt-' + Date.now(),
      user: currentUser,
    }
  })
}

export function logout() {
  return request(() => {
    currentUser = null
    localStorage.removeItem(USER_KEY)
    return { success: true }
  })
}

export function getMe() {
  return request(() => {
    if (!currentUser) {
      const savedId = localStorage.getItem(USER_KEY)
      const found = savedId ? MOCK_USERS.find((u) => u.id === savedId) : null
      currentUser = { ...(found || MOCK_USERS[0]) }
    }
    return currentUser
  })
}
