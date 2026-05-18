import './assets/main.css'
import './api/mock/_registry'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

if (import.meta.env.DEV) {
  window.__pinia = pinia
}

app.mount('#app')
