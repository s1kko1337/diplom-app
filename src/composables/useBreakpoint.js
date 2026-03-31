import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useBreakpoint() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)
  let timer = null

  function onResize() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      width.value = window.innerWidth
    }, 100)
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    clearTimeout(timer)
  })

  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed(() => width.value >= 1024)

  return { width, isMobile, isTablet, isDesktop }
}
