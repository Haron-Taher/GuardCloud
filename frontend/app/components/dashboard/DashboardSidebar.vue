<script setup lang="ts">
import { computed } from 'vue'

interface NavItem {
  key: string
  label: string
  icon: string
}

interface Props {
  activeSection: string
  storageUsed: number
  storageTotal: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'navigate', section: string): void
}>()

const navItems: NavItem[] = [
  { key: 'drive', label: 'My Drive', icon: '☁️' },
  { key: 'shared', label: 'Shared with me', icon: '👥' },
  { key: 'recent', label: 'Recent', icon: '🕐' },
  { key: 'starred', label: 'Starred', icon: '⭐' },
  { key: 'trash', label: 'Trash', icon: '🗑️' },
]

const storagePercent = computed(() => {
  return Math.min(100, (props.storageUsed / props.storageTotal) * 100)
})

const formatStorage = (bytes: number) => {
  const gb = bytes / (1024 * 1024 * 1024)
  return gb.toFixed(1)
}
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar__nav">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="sidebar__item"
        :class="{ 'sidebar__item--active': activeSection === item.key }"
        @click="$emit('navigate', item.key)"
      >
        <span class="sidebar__icon">{{ item.icon }}</span>
        <span class="sidebar__label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="sidebar__storage">
      <div class="storage__header">
        <span>Storage</span>
        <strong>{{ formatStorage(storageUsed) }} / {{ formatStorage(storageTotal) }} GB</strong>
      </div>
      <div class="storage__bar">
        <div class="storage__fill" :style="{ width: `${storagePercent}%` }"></div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--gc-card) 60%, transparent);
  border-right: 1px solid var(--gc-border);
  height: calc(100vh - 61px);
  position: sticky;
  top: 61px;
}

.sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  overflow-y: auto;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid transparent;
  border-radius: var(--gc-radius-md);
  background: transparent;
  color: var(--gc-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.sidebar__item:hover {
  background: var(--gc-card);
}

.sidebar__item--active {
  background: var(--gc-accent-light);
  border-color: color-mix(in srgb, var(--gc-accent) 30%, transparent);
  color: var(--gc-accent);
}

.sidebar__icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.sidebar__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__storage {
  padding: 16px;
  border-top: 1px solid var(--gc-border);
}

.storage__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--gc-text-muted);
  margin-bottom: 8px;
}

.storage__header strong {
  color: var(--gc-text);
}

.storage__bar {
  height: 6px;
  background: var(--gc-border);
  border-radius: var(--gc-radius-full);
  overflow: hidden;
}

.storage__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gc-accent), color-mix(in srgb, var(--gc-accent) 70%, #fff));
  border-radius: var(--gc-radius-full);
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .sidebar__label {
    display: none;
  }

  .sidebar__item {
    justify-content: center;
    padding: 10px;
  }

  .sidebar__icon {
    width: auto;
  }

  .storage__header span,
  .storage__header strong {
    display: none;
  }
}
</style>
