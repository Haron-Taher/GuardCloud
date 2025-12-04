<script setup lang="ts">
import { onMounted } from 'vue'

// Initialize theme on app mount
onMounted(() => {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('gc_theme')
  
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }
})
</script>

<template>
  <NuxtPage />
</template>
