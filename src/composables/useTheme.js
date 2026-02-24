import { ref } from 'vue'

const saved = localStorage.getItem('theme') || 'dark'
const theme = ref(saved)
document.documentElement.classList.toggle('dark', saved === 'dark')

export function useTheme() {
  function applyTheme(value) {
    theme.value = value
    localStorage.setItem('theme', value)
    document.documentElement.classList.toggle('dark', value === 'dark')
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme, applyTheme }
}
