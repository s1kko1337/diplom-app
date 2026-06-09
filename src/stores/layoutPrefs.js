import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'rudgormash:layout-prefs'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Пользовательская настройка раскладки страниц: порядок и видимость секций.
 * Хранится в localStorage и применяется компонентом CustomizableSections.
 * Структура: { [pageKey]: { order: string[], hidden: string[] } }
 */
export const useLayoutPrefsStore = defineStore('layoutPrefs', () => {
  const prefs = ref(loadFromStorage())

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs.value))
    } catch {
      // переполнение/недоступность localStorage — настройки просто не сохранятся
    }
  }

  function getPage(pageKey) {
    return prefs.value[pageKey] || { order: [], hidden: [] }
  }

  function ensurePage(pageKey) {
    if (!prefs.value[pageKey]) {
      prefs.value[pageKey] = { order: [], hidden: [] }
    }
    return prefs.value[pageKey]
  }

  function setOrder(pageKey, order) {
    ensurePage(pageKey).order = [...order]
    persist()
  }

  function toggleHidden(pageKey, id) {
    const page = ensurePage(pageKey)
    const idx = page.hidden.indexOf(id)
    if (idx === -1) {
      page.hidden = [...page.hidden, id]
    } else {
      page.hidden = page.hidden.filter((h) => h !== id)
    }
    persist()
  }

  function reset(pageKey) {
    delete prefs.value[pageKey]
    prefs.value = { ...prefs.value }
    persist()
  }

  return { prefs, getPage, setOrder, toggleHidden, reset }
})
