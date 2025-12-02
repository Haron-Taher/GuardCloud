<template>
  <div class="input-group">
    <div class="input-wrapper">
      <svg fill="none" viewBox="0 0 24 24" class="input-icon">
        <path stroke-width="1.5" stroke="currentColor" d="M12 10V14M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6Z"></path>
      </svg>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        required
        placeholder="Password"
        class="form-input"
        :type="showPassword ? 'text' : 'password'"
      />
      <button class="password-toggle" type="button" @click="showPassword = !showPassword">
        <svg v-if="!showPassword" fill="none" viewBox="0 0 24 24" class="eye-icon">
          <path stroke-width="1.5" stroke="currentColor" d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"></path>
          <circle stroke-width="1.5" stroke="currentColor" r="3" cy="12" cx="12"></circle>
        </svg>
        <svg v-else fill="none" viewBox="0 0 24 24" class="eye-icon">
          <path stroke-width="1.5" stroke="currentColor" d="M3 3L21 21M10.5 10.677C10.1903 11.0046 10 11.4806 10 12C10 13.1046 10.8954 14 12 14C12.5194 14 12.9954 13.8097 13.323 13.5"></path>
          <path stroke-width="1.5" stroke="currentColor" d="M7.362 7.561C5.68 8.74 4.279 10.42 3 12C4.889 14.991 8.282 18 12 18C13.55 18 15.043 17.477 16.395 16.676M12 6C15.79 6 19.175 8.923 21 12C20.5217 12.8012 19.9567 13.5435 19.319 14.215"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ modelValue?: string }>()
defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const showPassword = ref(false)
</script>

<style scoped>
  .input-group 
  { 
    margin-bottom: 16px; 
  }

  .input-wrapper 
  { 
    position: relative; display: flex; align-items: center; 
  }

  .form-input 
  {
    width: 100%; height: 40px; padding: 0 36px; font-size: 14px;
    border: 1px solid #e2e8f0; border-radius: 10px; background: var(--bg-input);
    color: var(--text-main); transition: all 0.2s ease;
  }

  .form-input::placeholder 
  { 
    color: var(--text-secondary); 
  }

  .input-icon 
  {
    position: absolute; left: 12px; width: 16px; height: 16px;
    color: var(--text-secondary); pointer-events: none;
  }

  .password-toggle 
  {
    position: absolute; right: 12px; display: flex; align-items: center;
    padding: 4px; background: none; border: none; color: var(--text-secondary);
    cursor: pointer; transition: all 0.2s ease;
  }

  .eye-icon 
  { 
    width: 16px; height: 16px; 
  }

  .form-input:hover 
  { 
    border-color: #cbd5e1; 
  }

  .form-input:focus 
  {
    outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px var(--primary-light);
  }

  .password-toggle:hover 
  { 
    color: var(--primary); transform: scale(1.1); 
  }

  .submit-button:active 
  { 
    transform: translateY(0); box-shadow: none; 
  }

  .password-toggle:active 
  { 
    transform: scale(0.9); 
  }

  .form-input:not(:placeholder-shown):valid 
  { 
    border-color: var(--success); 
  }

  .form-input:not(:placeholder-shown):valid ~ .input-icon 
  { 
    color: var(--success); 
  }

  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }

  .form-input:not(:placeholder-shown):invalid 
  { 
    border-color:#ef4444; animation: shake 0.2s ease-in-out; 
  }

  .form-input:not(:placeholder-shown):invalid ~ .input-icon 
  { 
    color: #ef4444; 
  }
</style>
