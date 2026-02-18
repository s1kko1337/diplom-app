import { ref, onMounted, onUnmounted } from 'vue'

export function useLiveData(updateInterval = 5000) {
  const timeSinceUpdate = ref(0)
  let updateTimer = null
  let countTimer = null

  onMounted(() => {
    updateTimer = setInterval(() => {
      timeSinceUpdate.value = 0
    }, updateInterval)

    countTimer = setInterval(() => {
      timeSinceUpdate.value++
    }, 1000)
  })

  onUnmounted(() => {
    clearInterval(updateTimer)
    clearInterval(countTimer)
  })

  return { timeSinceUpdate }
}
