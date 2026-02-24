import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useClock() {
  const now = ref(new Date())
  let timer = null

  const timeString = computed(() => now.value.toLocaleTimeString('ru-RU'))

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onUnmounted(() => {
    clearInterval(timer)
  })

  return { now, timeString }
}
