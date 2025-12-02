<template>
  <button class="submit-button" type="submit" :disabled="disabled">
    <span class="button-text">{{ text || 'Log In' }}</span>
    <div class="button-glow"></div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
  text?: string
}>()
</script>

<style scoped>
  .submit-button 
  {
    position: relative; width: 100%; height: 40px; margin-top: 8px;
    background: var(--primary); color: white; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 500; cursor: pointer; overflow: hidden; transition: all 0.2s ease;
  }

  .submit-button:disabled
  {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .button-glow 
  {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: translateX(-100%); transition: transform 0.5s ease;
  }

  .submit-button:hover:not(:disabled) 
  {
    background: var(--primary-dark); transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25), 0 2px 4px rgba(59, 130, 246, 0.15);
  }

  .submit-button:hover:not(:disabled) .button-glow 
  { 
    transform: translateX(100%); 
  }

  .submit-button:active:not(:disabled) 
  { 
    transform: translateY(0); box-shadow: none; 
  }
</style>
