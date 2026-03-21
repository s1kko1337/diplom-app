import { onMounted, onUnmounted } from 'vue'

export function useSwipe(elementRef, { onSwipeLeft, onSwipeRight, threshold = 50 } = {}) {
  let startX = 0
  let startY = 0

  function onPointerDown(e) {
    startX = e.clientX
    startY = e.clientY
  }

  function onPointerUp(e) {
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx)) return
    if (dx < 0 && onSwipeLeft) onSwipeLeft()
    if (dx > 0 && onSwipeRight) onSwipeRight()
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointerup', onPointerUp)
  })

  onUnmounted(() => {
    const el = elementRef.value
    if (!el) return
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointerup', onPointerUp)
  })
}
