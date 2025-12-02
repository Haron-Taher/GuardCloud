<script setup>
</script>

<template>
  <div class="modern-form">
    <slot />
  </div>
</template>

<style scoped>
.modern-form
{
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: rgba(59, 130, 246, 0.1);
  --success: #10b981;
  --text-main: #1e293b;
  --text-secondary: #64748b;
  --bg-input: #f8fafc;

  position: relative;
  width: 100%;
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(148, 163, 184, 0.1);
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
