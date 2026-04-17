import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/preferences'
import { createSeed } from '@/api/mock/seed/preferences.seed'

const DEFAULTS = createSeed()

export const usePreferencesStore = defineStore('preferences', () => {
  const preferences = ref(null)
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      preferences.value = await api.getPreferences()
    } finally {
      loading.value = false
    }
  }

  async function save(section, data) {
    preferences.value = await api.updatePreferences(section, data)
  }

  async function setTheme(theme) {
    if (preferences.value) {
      preferences.value = { ...preferences.value, theme }
    }
    preferences.value = await api.updateTheme(theme)
  }

  async function reset() {
    preferences.value = await api.resetPreferences()
  }

  const display = computed(() => preferences.value?.display ?? DEFAULTS.display)
  const notifications = computed(() => preferences.value?.notifications ?? DEFAULTS.notifications)
  const thresholds = computed(() => preferences.value?.thresholds ?? DEFAULTS.thresholds)
  const security = computed(() => preferences.value?.security ?? DEFAULTS.security)
  const theme = computed(() => preferences.value?.theme ?? DEFAULTS.theme)

  return {
    preferences,
    loading,
    display,
    notifications,
    thresholds,
    security,
    theme,
    load,
    save,
    setTheme,
    reset,
  }
})
