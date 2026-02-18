import { ref, onMounted } from 'vue'

const theme = ref('dark')

export function useTheme() {
  function applyTheme(value) {
    theme.value = value
    localStorage.setItem('theme', value)
    document.documentElement.classList.toggle('dark', value === 'dark')
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    applyTheme(saved)
  })

  return { theme, toggleTheme, applyTheme }
}
