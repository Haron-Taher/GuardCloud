<template>
  <aside class="sidebar">
    <!-- New Button -->
    <button class="new-button" @click="emit('newAction')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
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
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path :d="item.iconPath" />
        </svg>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Storage Usage -->
    <div class="storage-section">
      <div class="storage-header">
        <svg class="storage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        </svg>
        <span class="storage-label">Storage</span>
      </div>
      
      <div class="storage-bar-container">
        <div class="storage-bar">
          <div 
            class="storage-fill" 
            :style="{ width: `${storagePercentage}%` }"
            :class="{ warning: storagePercentage > 80, critical: storagePercentage > 95 }"
          ></div>
        </div>
      </div>
      
      <div class="storage-text">
        {{ formatSize(storageUsed) }} of {{ formatSize(storageLimit) }} used
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
  { 
    id: 'drive', 
    label: 'My Drive',
    iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'
  },
  { 
    id: 'starred', 
    label: 'Starred',
    iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
  },
  { 
    id: 'trash', 
    label: 'Trash',
    iconPath: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'
  },
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
  width: 240px;
  background: var(--gc-bg-primary);
  border-right: 1px solid var(--gc-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 20px 14px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

/* New Button */
.new-button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 18px;
  background: var(--gc-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.new-button svg {
  width: 20px;
  height: 20px;
}

.new-button:hover {
  background: var(--gc-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
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
  padding: 11px 14px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--gc-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.nav-item:hover {
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
}

.nav-item.active .nav-icon {
  color: var(--gc-primary);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Storage Section */
.storage-section {
  margin-top: auto;
  padding: 16px;
  background: var(--gc-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--gc-border);
}

.storage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.storage-icon {
  width: 18px;
  height: 18px;
  color: var(--gc-text-secondary);
}

.storage-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--gc-text-secondary);
}

.storage-bar-container {
  margin-bottom: 10px;
}

.storage-bar {
  height: 6px;
  background: var(--gc-bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gc-primary) 0%, #8b5cf6 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.storage-fill.warning {
  background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
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
