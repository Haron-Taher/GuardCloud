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
  background: var(--gc-card, #f5f7fb);
  border: 1px solid var(--gc-border, #e6e9ef);
  border-radius: var(--gc-radius-lg, 16px);
  transition: all 0.2s ease;
}

.gc-card--elevated {
  box-shadow: var(--gc-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.gc-card--outlined {
  background: transparent;
}

.gc-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--gc-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
}

.gc-card__header {
  padding: 20px 20px 0;
}

.gc-card__title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--gc-text, #0b1220);
}

.gc-card__subtitle {
  font-size: 14px;
  color: var(--gc-text-muted, #5b6b7a);
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
  border-top: 1px solid var(--gc-border, #e6e9ef);
  margin-top: -4px;
  padding-top: 16px;
}
</style>
