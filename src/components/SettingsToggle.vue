<template>
  <div
    class="flex items-center justify-between py-3"
    :class="$attrs.class || 'border-b border-border'"
  >
    <div>
      <div class="text-sm mb-1">{{ label }}</div>
      <div class="text-xs opacity-50">{{ description }}</div>
    </div>
    <button
      class="w-12 h-6 relative transition-all duration-150 border-2"
      :class="model ? 'bg-primary border-primary' : 'bg-surface-2 border-border'"
      @click="model = !model"
    >
      <div
        class="absolute top-0 w-5 h-5 bg-background border border-border transition-all duration-150"
        :class="model ? 'right-0' : 'left-0'"
      />
    </button>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  description: { type: String, default: '' },
})

const model = defineModel({ type: Boolean, default: false })
</script>
