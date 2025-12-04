<template>
  <component
    :is="componentType"
    :to="to"
    :href="href"
    :type="isButton ? type : undefined"
    :disabled="disabled || loading"
    :class="[
      'gc-button',
      `gc-button--${variant}`,
      `gc-button--${size}`,
      { 'gc-button--loading': loading, 'gc-button--icon-only': iconOnly }
    ]"
  >
    <span v-if="loading" class="gc-button__spinner" />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'

interface Props {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  to?: string
  href?: string
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  iconOnly: false,
})

const componentType = computed(() => {
  if (props.to) return NuxtLink
  if (props.href) return 'a'
  return 'button'
})

const isButton = computed(() => !props.to && !props.href)
</script>

<style scoped>
.gc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.15s ease;
  outline: none;
  position: relative;
}

.gc-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.gc-button:active:not(:disabled) {
  transform: translateY(1px);
}

.gc-button:disabled,
.gc-button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Sizes */
.gc-button--sm {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 8px;
}

.gc-button--md {
  padding: 10px 16px;
}

.gc-button--lg {
  padding: 14px 24px;
  font-size: 16px;
  border-radius: 12px;
}

.gc-button--icon-only.gc-button--sm { padding: 6px; }
.gc-button--icon-only.gc-button--md { padding: 10px; }
.gc-button--icon-only.gc-button--lg { padding: 14px; }

/* Variants */
.gc-button--primary {
  background: var(--gc-primary);
  color: #fff;
}

.gc-button--primary:hover:not(:disabled):not([disabled]) {
  background: var(--gc-primary-hover);
}

.gc-button--ghost {
  background: transparent;
  color: var(--gc-text-primary);
  border-color: var(--gc-border);
}

.gc-button--ghost:hover:not(:disabled):not([disabled]) {
  background: var(--gc-bg-tertiary);
}

.gc-button--outline {
  background: transparent;
  color: var(--gc-primary);
  border-color: var(--gc-primary);
}

.gc-button--outline:hover:not(:disabled):not([disabled]) {
  background: rgba(99, 102, 241, 0.1);
}

.gc-button--danger {
  background: var(--gc-error);
  color: #fff;
}

.gc-button--danger:hover:not(:disabled):not([disabled]) {
  background: #dc2626;
}

/* Loading */
.gc-button--loading {
  color: transparent;
}

.gc-button__spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.gc-button--loading .gc-button__spinner {
  color: inherit;
  opacity: 1;
}

.gc-button--primary .gc-button__spinner { color: #fff; }
.gc-button--ghost .gc-button__spinner { color: var(--gc-text-primary); }

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
