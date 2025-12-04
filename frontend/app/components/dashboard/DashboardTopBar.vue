<template>
  <header class="topbar">
    <!-- Logo -->
    <div class="topbar-left">
      <NuxtLink to="/dashboard" class="logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"/>
        </svg>
        <span class="logo-text">GuardCloud</span>
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="topbar-center">
      <div class="search-container">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input 
          ref="searchInput"
          type="text"
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          placeholder="Search files..."
          class="search-input"
        />
        <span v-if="searchQuery" class="search-clear" @click="$emit('update:searchQuery', '')">×</span>
        <span class="search-shortcut">/</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="topbar-right">
      <!-- Theme Toggle -->
      <button class="icon-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
        <span v-if="isDark">☀️</span>
        <span v-else>🌙</span>
      </button>

      <!-- New Menu -->
      <div class="dropdown" ref="newDropdown">
        <button class="action-btn" @click="toggleNewMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span class="btn-text">New</span>
        </button>
        <div v-if="showNewMenu" class="dropdown-menu">
          <button class="dropdown-item" @click="handleNewAction('folder')">
            <span class="dropdown-icon">📁</span>
            New folder
          </button>
          <button class="dropdown-item" @click="handleNewAction('upload')">
            <span class="dropdown-icon">⬆️</span>
            Upload files
          </button>
        </div>
      </div>

      <!-- User Menu -->
      <div class="dropdown" ref="userDropdown">
        <button class="user-btn" @click="toggleUserMenu">
          <span class="user-avatar">{{ userInitial }}</span>
        </button>
        <div v-if="showUserMenu" class="dropdown-menu dropdown-right">
          <div class="dropdown-header">
            <span class="user-name">{{ user.username }}</span>
            <span class="user-email">{{ user.email || 'No email set' }}</span>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click="handleUserAction('settings')">
            <span class="dropdown-icon">⚙️</span>
            Settings
          </button>
          <button class="dropdown-item" @click="handleUserAction('activity')">
            <span class="dropdown-icon">📋</span>
            Activity
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item text-danger" @click="handleUserAction('logout')">
            <span class="dropdown-icon">🚪</span>
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

const props = defineProps<{
  user: { username: string; email?: string }
  searchQuery: string
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'new-folder'): void
  (e: 'upload'): void
  (e: 'upload-folder'): void
  (e: 'logout'): void
  (e: 'settings'): void
  (e: 'activity'): void
}>()

const { isDark, toggleTheme, init: initTheme } = useTheme()

const searchInput = ref<HTMLInputElement | null>(null)
const showNewMenu = ref(false)
const showUserMenu = ref(false)
const newDropdown = ref<HTMLElement | null>(null)
const userDropdown = ref<HTMLElement | null>(null)

const userInitial = computed(() => {
  return props.user.username?.charAt(0).toUpperCase() || 'U'
})

onMounted(() => {
  initTheme()
})

function toggleNewMenu() {
  showNewMenu.value = !showNewMenu.value
  showUserMenu.value = false
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  showNewMenu.value = false
}

function handleNewAction(action: string) {
  showNewMenu.value = false
  
  switch (action) {
    case 'folder':
      emit('new-folder')
      break
    case 'upload':
      emit('upload')
      break
    case 'upload-folder':
      emit('upload-folder')
      break
  }
}

function handleUserAction(action: string) {
  showUserMenu.value = false
  
  switch (action) {
    case 'settings':
      emit('settings')
      break
    case 'activity':
      emit('activity')
      break
    case 'logout':
      emit('logout')
      break
  }
}

function handleClickOutside(e: MouseEvent) {
  if (newDropdown.value && !newDropdown.value.contains(e.target as Node)) {
    showNewMenu.value = false
  }
  if (userDropdown.value && !userDropdown.value.contains(e.target as Node)) {
    showUserMenu.value = false
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === '/' && !(e.target as HTMLElement).matches('input, textarea')) {
    e.preventDefault()
    searchInput.value?.focus()
  }
  if (e.key === 'Escape') {
    showNewMenu.value = false
    showUserMenu.value = false
    searchInput.value?.blur()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 20px;
  background: var(--gc-bg-primary);
  border-bottom: 1px solid var(--gc-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Logo */
.topbar-left {
  flex: 0 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: var(--gc-primary);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

/* Search */
.topbar-center {
  flex: 1;
  max-width: 560px;
  padding: 0 24px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: var(--gc-text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 80px 10px 42px;
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--gc-primary);
  background: var(--gc-bg-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: var(--gc-text-secondary);
}

.search-clear {
  position: absolute;
  right: 44px;
  font-size: 18px;
  color: var(--gc-text-secondary);
  cursor: pointer;
  padding: 4px;
}

.search-clear:hover {
  color: var(--gc-text-primary);
}

.search-shortcut {
  position: absolute;
  right: 14px;
  padding: 2px 8px;
  background: var(--gc-bg-tertiary);
  border-radius: 4px;
  font-size: 12px;
  color: var(--gc-text-secondary);
  font-family: monospace;
}

/* Actions */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--gc-bg-tertiary);
  border-color: var(--gc-primary);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--gc-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn:hover {
  background: var(--gc-primary-hover);
}

.user-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--gc-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.user-btn:hover {
  transform: scale(1.05);
}

.user-avatar {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

/* Dropdown */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  box-shadow: var(--gc-shadow-lg);
  padding: 6px;
  z-index: 200;
  animation: dropdownFadeIn 0.15s ease-out;
}

.dropdown-right {
  left: auto;
  right: 0;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 12px;
}

.user-name {
  display: block;
  font-weight: 600;
  color: var(--gc-text-primary);
  font-size: 14px;
}

.user-email {
  display: block;
  font-size: 12px;
  color: var(--gc-text-secondary);
  margin-top: 2px;
}

.dropdown-divider {
  height: 1px;
  background: var(--gc-border);
  margin: 6px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  color: var(--gc-text-primary);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.dropdown-item:hover {
  background: var(--gc-bg-tertiary);
}

.dropdown-item.text-danger {
  color: var(--gc-error);
}

.dropdown-item.text-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dropdown-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .topbar {
    padding: 0 12px;
  }
  
  .logo-text {
    display: none;
  }
  
  .topbar-center {
    padding: 0 12px;
  }
  
  .search-shortcut {
    display: none;
  }
  
  .btn-text {
    display: none;
  }
  
  .action-btn {
    padding: 10px;
  }
}
</style>
