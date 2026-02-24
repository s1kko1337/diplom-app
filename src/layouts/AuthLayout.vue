<template>
  <div class="min-h-screen bg-background text-foreground flex items-center justify-center">
    <div class="w-full max-w-md px-6">
      <div class="flex flex-col items-center mb-8">
        <AppLogo class="mb-4" />
        <h1 class="text-xl">Рудгормаш</h1>
        <div class="text-xs opacity-50 mt-1">СИСТЕМА МОНИТОРИНГА ОБОРУДОВАНИЯ</div>
      </div>
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import AppLogo from '@/components/AppLogo.vue'
</script>
