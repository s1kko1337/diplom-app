import { computed, watchEffect } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'

const cached = localStorage.getItem('theme')
if (cached) {
  document.documentElement.classList.toggle('dark', cached === 'dark')
}

export function useTheme() {
  const preferences = usePreferencesStore()
  const theme = computed(() => preferences.theme)

  watchEffect(() => {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
    localStorage.setItem('theme', theme.value)
  })

  function applyTheme(value) {
    preferences.setTheme(value)
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme, applyTheme }
}
