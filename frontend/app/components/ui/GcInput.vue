<template>
  <div class="gc-input-wrapper">
    <label v-if="label" :for="inputId" class="gc-input-label">
      {{ label }}
      <span v-if="required" class="gc-input-required">*</span>
    </label>

    <div class="gc-input-container" :class="{ 'gc-input-container--has-icon': !!icon }">
      <component v-if="icon" :is="icon" class="gc-input-icon" />
      
      <input
        :id="inputId"
        :value="modelValue"
        :type="computedType"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        class="gc-input"
        :class="{ 'gc-input--error': error }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <button
        v-if="type === 'password'"
        type="button"
        class="gc-input-toggle"
        @click="showPassword = !showPassword"
        tabindex="-1"
      >
        <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 3L21 21M10.5 10.677C10.19 11.005 10 11.481 10 12C10 13.105 10.895 14 12 14C12.519 14 12.995 13.81 13.323 13.5" />
          <path d="M7.362 7.561C5.68 8.74 4.279 10.42 3 12C4.889 14.991 8.282 18 12 18C13.55 18 15.043 17.477 16.395 16.676M12 6C15.79 6 19.175 8.923 21 12C20.522 12.801 19.957 13.544 19.319 14.215" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>

    <p v-if="error" class="gc-input-error">{{ error }}</p>
    <p v-else-if="hint" class="gc-input-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue'

interface Props {
  modelValue?: string
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  autocomplete?: string
  icon?: Component
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  required: false,
  disabled: false,
})

defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const inputId = computed(() => `gc-input-${Math.random().toString(36).slice(2, 9)}`)
const showPassword = ref(false)
const computedType = computed(() => {
  if (props.type === 'password' && showPassword.value) return 'text'
  return props.type
})
</script>

<style scoped>
.gc-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gc-input-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--gc-text, #0b1220);
}

.gc-input-required {
  color: var(--gc-error, #ef4444);
  margin-left: 2px;
}

.gc-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.gc-input-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: var(--gc-text-muted, #5b6b7a);
  pointer-events: none;
}

.gc-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--gc-bg-subtle, #f8fafc);
  color: var(--gc-text, #0b1220);
  border: 1px solid var(--gc-border, #e6e9ef);
  border-radius: var(--gc-radius-md, 12px);
  font-size: 14px;
  outline: none;
  transition: all 0.15s ease;
}

.gc-input-container--has-icon .gc-input {
  padding-left: 40px;
}

.gc-input::placeholder {
  color: var(--gc-text-muted, #5b6b7a);
}

.gc-input:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--gc-border, #e6e9ef) 50%, var(--gc-accent, #0b57d0));
}

.gc-input:focus {
  border-color: var(--gc-accent, #0b57d0);
  background: var(--gc-bg, #fff);
  box-shadow: 0 0 0 3px var(--gc-accent-light, rgba(11, 87, 208, 0.1));
}

.gc-input--error {
  border-color: var(--gc-error, #ef4444);
}

.gc-input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.gc-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gc-input-toggle {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: none;
  border: none;
  color: var(--gc-text-muted, #5b6b7a);
  cursor: pointer;
  transition: color 0.15s ease;
}

.gc-input-toggle:hover {
  color: var(--gc-accent, #0b57d0);
}

.gc-input-toggle svg {
  width: 18px;
  height: 18px;
}

.gc-input-error {
  font-size: 13px;
  color: var(--gc-error, #ef4444);
  margin: 0;
}

.gc-input-hint {
  font-size: 13px;
  color: var(--gc-text-muted, #5b6b7a);
  margin: 0;
}
</style>
