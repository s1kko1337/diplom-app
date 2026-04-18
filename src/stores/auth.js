import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import { usePreferencesStore } from '@/stores/preferences'
import { migrateLegacyKeys } from '@/api/mock/_runtime'

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || 'Пользователь')
  const userRole = computed(() => user.value?.role || '')
  const userId = computed(() => user.value?.id || null)

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const data = await authApi.login(credentials)
      token.value = data.token
      user.value = data.user
      localStorage.setItem(TOKEN_KEY, data.token)
      migrateLegacyKeys()
      const preferencesStore = usePreferencesStore()
      await preferencesStore.load()
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      user.value = await authApi.getMe()
    } catch {
      token.value = null
      localStorage.removeItem(TOKEN_KEY)
      return
    }
    try {
      migrateLegacyKeys()
      const preferencesStore = usePreferencesStore()
      await preferencesStore.load()
    } catch (e) {
      console.warn('[auth] Post-login hooks failed:', e)
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userName,
    userRole,
    userId,
    login,
    logout,
    fetchUser,
  }
})
