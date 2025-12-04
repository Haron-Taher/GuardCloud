<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24" 
    fill="none" 
    :stroke="color" 
    :stroke-width="strokeWidth"
    stroke-linecap="round" 
    stroke-linejoin="round"
    :class="['icon', { 'icon-filled': filled }]"
  >
    <path :d="iconPath" :fill="filled ? color : 'none'" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { icons, type icons as IconNames } from '~/utils/icons'

const props = withDefaults(defineProps<{
  name: keyof typeof IconNames
  size?: number | string
  color?: string
  strokeWidth?: number | string
  filled?: boolean
}>(), {
  size: 20,
  color: 'currentColor',
  strokeWidth: 1.5,
  filled: false
})

const iconPath = computed(() => icons[props.name] || icons.file)
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
