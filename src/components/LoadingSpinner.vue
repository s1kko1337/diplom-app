<template>
  <div class="flex items-center justify-center p-12">
    <div class="relative w-16 h-16">
      <div
        class="absolute inset-0 border-2 border-primary animate-spin"
        style="animation-duration: 2s"
      />
      <div
        class="absolute inset-2 border-2 border-primary animate-spin"
        style="animation-duration: 1.5s; animation-direction: reverse"
      />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-2 h-2 bg-primary animate-pulse" />
      </div>
    </div>

    <div class="ml-4 text-sm opacity-70 animate-pulse">ЗАГРУЗКА ДАННЫХ...</div>
  </div>
</template>

<script setup></script>

<style scoped></style>
