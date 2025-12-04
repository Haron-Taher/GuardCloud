<template>
  <aside class="sidebar">
    <!-- New Button -->
    <button class="new-button" @click="emit('newAction')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span>New</span>
    </button>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <button 
        v-for="item in navItems" 
        :key="item.id"
        class="nav-item"
        :class="{ active: activeSection === item.id }"
        @click="emit('navigate', item.id)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Storage Usage -->
    <div class="storage-section">
      <div class="storage-header">
        <svg class="storage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
        <span class="storage-label">Storage</span>
      </div>
      
      <div class="storage-bar">
        <div 
          class="storage-fill" 
          :style="{ width: `${storagePercentage}%` }"
          :class="{ warning: storagePercentage > 80, critical: storagePercentage > 95 }"
        ></div>
      </div>
      
      <div class="storage-text">
        {{ formatSize(storageUsed) }} of {{ formatSize(storageLimit) }}
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatFileSize } from '~/utils/fileIcons'

const props = defineProps<{
  activeSection: string
  storageUsed: number
  storageLimit: number
}>()

const emit = defineEmits<{
  (e: 'navigate', section: string): void
  (e: 'newAction'): void
}>()

const navItems = [
  { id: 'drive', icon: '📁', label: 'My Drive' },
  { id: 'starred', icon: '⭐', label: 'Starred' },
  { id: 'trash', icon: '🗑️', label: 'Trash' },
]

const storagePercentage = computed(() => {
  if (!props.storageLimit) return 0
  return Math.min(100, Math.round((props.storageUsed / props.storageLimit) * 100))
})

function formatSize(bytes: number) {
  return formatFileSize(bytes)
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: var(--gc-bg-primary);
  border-right: 1px solid var(--gc-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 16px 12px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

/* New Button */
.new-button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: var(--gc-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.2s;
}

.new-button svg {
  width: 20px;
  height: 20px;
}

.new-button:hover {
  background: var(--gc-primary-hover);
  transform: translateY(-1px);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--gc-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.nav-item:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
  font-weight: 500;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

/* Storage Section */
.storage-section {
  margin-top: auto;
  padding: 16px;
  background: var(--gc-bg-secondary);
  border-radius: 10px;
}

.storage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.storage-icon {
  width: 16px;
  height: 16px;
  color: var(--gc-text-secondary);
}

.storage-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gc-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.storage-bar {
  height: 6px;
  background: var(--gc-bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.storage-fill {
  height: 100%;
  background: var(--gc-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.storage-fill.warning {
  background: var(--gc-warning);
}

.storage-fill.critical {
  background: var(--gc-error);
}

.storage-text {
  font-size: 12px;
  color: var(--gc-text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
