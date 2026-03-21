<template>
  <div class="flex items-center gap-2 px-3 py-1 border rounded-md" :class="containerClass">
    <div class="w-2 h-2 rounded-full" :class="dotClass" />
    <span class="text-xs" :class="textClass">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConnectionStore } from '@/stores/connection'

const connectionStore = useConnectionStore()

const label = computed(() => {
  if (connectionStore.isOnline) return 'ПОДКЛЮЧЕНО'
  if (connectionStore.isReconnecting) return 'ПЕРЕПОДКЛЮЧЕНИЕ...'
  return 'НЕТ СВЯЗИ'
})

const dotClass = computed(() => {
  if (connectionStore.isOnline) return 'bg-primary'
  if (connectionStore.isReconnecting) return 'bg-yellow-500 animate-pulse'
  return 'bg-red-500 animate-pulse'
})

const containerClass = computed(() => {
  if (connectionStore.isDisconnected) return 'border-red-500'
  if (connectionStore.isReconnecting) return 'border-yellow-500'
  return 'border-border'
})

const textClass = computed(() => {
  if (connectionStore.isOnline) return 'opacity-70'
  return ''
})
</script>
