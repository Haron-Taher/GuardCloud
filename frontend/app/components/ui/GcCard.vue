<template>
  <div class="gc-card" :class="[`gc-card--${variant}`, { 'gc-card--hoverable': hoverable }]">
    <div v-if="$slots.header || title" class="gc-card__header">
      <slot name="header">
        <h3 v-if="title" class="gc-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="gc-card__subtitle">{{ subtitle }}</p>
      </slot>
    </div>
    
    <div class="gc-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="gc-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  variant?: 'default' | 'elevated' | 'outlined'
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: false,
})
</script>

<style scoped>
.gc-card {
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  transition: all 0.2s ease;
}

.gc-card--elevated {
  box-shadow: var(--gc-shadow-lg);
}

.gc-card--outlined {
  background: transparent;
}

.gc-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--gc-shadow-lg);
}

.gc-card__header {
  padding: 20px 20px 0;
}

.gc-card__title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--gc-text-primary);
}

.gc-card__subtitle {
  font-size: 14px;
  color: var(--gc-text-secondary);
  margin: 0;
}

.gc-card__body {
  padding: 20px;
}

.gc-card__header + .gc-card__body {
  padding-top: 16px;
}

.gc-card__footer {
  padding: 0 20px 20px;
  border-top: 1px solid var(--gc-border);
  margin-top: -4px;
  padding-top: 16px;
}
</style>
