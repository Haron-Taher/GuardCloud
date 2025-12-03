<template>
  <aside class="sidebar">
    <!-- New Button -->
    <button class="new-button" @click="emit('newAction')">
      <span class="new-icon">+</span>
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
        <span class="storage-icon">💾</span>
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
        {{ formatSize(storageUsed) }} of {{ formatSize(storageLimit) }} used
      </div>
      
      <div v-if="storagePercentage > 80" class="storage-warning">
        {{ storagePercentage > 95 ? 'Storage almost full!' : 'Running low on storage' }}
      </div>
    </div>

    <!-- Footer Links -->
    <div class="sidebar-footer">
      <a href="#" class="footer-link" @click.prevent="emit('navigate', 'settings')">
        ⚙️ Settings
      </a>
      <a href="#" class="footer-link" @click.prevent="emit('navigate', 'help')">
        ❓ Help
      </a>
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
  { id: 'shared', icon: '👥', label: 'Shared with me' },
  { id: 'recent', icon: '🕐', label: 'Recent' },
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
  width: 240px;
  background: var(--gc-bg-primary);
  border-right: 1px solid var(--gc-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 16px 12px;
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
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.new-button:hover {
  background: var(--gc-primary-hover);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.new-icon {
  font-size: 20px;
  font-weight: 300;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  border-radius: 12px;
  margin-bottom: 12px;
}

.storage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.storage-icon {
  font-size: 16px;
}

.storage-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--gc-text-primary);
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
  background: #f59e0b;
}

.storage-fill.critical {
  background: var(--gc-error);
}

.storage-text {
  font-size: 12px;
  color: var(--gc-text-secondary);
}

.storage-warning {
  margin-top: 8px;
  padding: 6px 10px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 6px;
  font-size: 11px;
  color: #d97706;
  font-weight: 500;
}

.storage-fill.critical + .storage-text + .storage-warning,
.storage-section:has(.storage-fill.critical) .storage-warning {
  background: rgba(239, 68, 68, 0.1);
  color: var(--gc-error);
}

/* Footer Links */
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  color: var(--gc-text-secondary);
  text-decoration: none;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.15s;
}

.footer-link:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
