<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" @click="$emit('close')" />

      <!-- Modal -->
      <div
        class="relative z-10 w-full max-w-2xl bg-status-critical-bg text-status-critical-text border-4 border-primary animate-pulse"
        :style="{ clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%)' }"
      >
        <div
          class="absolute top-0 right-0 w-10 h-10 bg-primary"
          :style="{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }"
        />

        <div class="p-8">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-3xl mb-2">&#9888; КРИТИЧЕСКИЙ АЛЕРТ</h2>
              <div class="metric-value text-sm opacity-70">{{ timestamp }}</div>
            </div>
            <button
              class="p-2 border-2 border-current hover:bg-status-critical-text hover:text-status-critical-bg transition-all duration-150"
              @click="$emit('close')"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-6">
            <div>
              <label class="text-xs mb-2 block opacity-70">ОБОРУДОВАНИЕ</label>
              <div class="text-2xl metric-value">{{ alert.equipment }}</div>
            </div>

            <div>
              <label class="text-xs mb-2 block opacity-70">ОПИСАНИЕ ПРОБЛЕМЫ</label>
              <div class="text-xl">{{ alert.title }}</div>
              <div class="mt-3 text-base opacity-80">{{ alert.description }}</div>
            </div>

            <div class="flex items-center gap-4 pt-6 border-t-2 border-current">
              <button
                class="flex-1 px-6 py-4 border-2 border-current hover:bg-status-critical-text hover:text-status-critical-bg transition-all duration-150"
                @click="$emit('close')"
              >
                <span class="text-sm">ПОДТВЕРДИТЬ И ЗАКРЫТЬ</span>
              </button>

              <button
                class="flex-1 px-6 py-4 bg-primary text-status-critical-bg border-2 border-current hover:opacity-80 transition-all duration-150"
              >
                <span class="text-sm">ЭКСТРЕННАЯ ОСТАНОВКА</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

defineProps({
  show: { type: Boolean, default: false },
  alert: { type: Object, required: true },
})

defineEmits(['close'])

const timestamp = computed(() => new Date().toLocaleString('ru-RU'))
</script>

<style scoped></style>
