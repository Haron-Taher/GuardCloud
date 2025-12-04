<template>
  <header class="topbar">
    <!-- Logo -->
    <div class="topbar-left">
      <NuxtLink to="/dashboard" class="logo">
        <img src="~/assets/logos/securecloud.png" alt="GuardCloud" class="logo-img" />
        <span class="logo-text">GuardCloud</span>
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="topbar-center">
      <div class="search-container">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
        <span v-if="searchQuery" class="search-clear" @click="$emit('update:searchQuery', '')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </span>
        <kbd class="search-shortcut">/</kbd>
      </div>
    </div>

    <!-- Actions -->
    <div class="topbar-right">
      <!-- Theme Toggle -->
      <button class="icon-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
        <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <!-- New Menu -->
      <div class="dropdown" ref="newDropdown">
        <button class="action-btn" @click="toggleNewMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span class="btn-text">New</span>
        </button>
        <Transition name="dropdown">
          <div v-if="showNewMenu" class="dropdown-menu">
            <button class="dropdown-item" @click="handleNewAction('folder')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              New folder
            </button>
            <button class="dropdown-item" @click="handleNewAction('upload')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              Upload files
            </button>
          </div>
        </Transition>
      </div>

      <!-- User Menu -->
      <div class="dropdown" ref="userDropdown">
        <button class="user-btn" @click="toggleUserMenu">
          <span class="user-avatar">{{ userInitial }}</span>
        </button>
        <Transition name="dropdown">
          <div v-if="showUserMenu" class="dropdown-menu dropdown-right">
            <div class="dropdown-header">
              <div class="dropdown-avatar">{{ userInitial }}</div>
              <div class="dropdown-user-info">
                <span class="user-name">{{ user.username }}</span>
                <span class="user-email">{{ user.email || 'No email set' }}</span>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="handleUserAction('settings')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </button>
            <button class="dropdown-item" @click="handleUserAction('activity')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Activity
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item text-danger" @click="handleUserAction('logout')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sign out
            </button>
          </div>
        </Transition>
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
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
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
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
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

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

/* Search */
.topbar-center {
  flex: 1;
  max-width: 520px;
  padding: 0 32px;
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
  border-radius: 12px;
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
  right: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--gc-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.search-clear:hover {
  color: var(--gc-text-primary);
  background: var(--gc-bg-tertiary);
}

.search-clear svg {
  width: 14px;
  height: 14px;
}

.search-shortcut {
  position: absolute;
  right: 14px;
  padding: 3px 8px;
  background: var(--gc-bg-tertiary);
  border: 1px solid var(--gc-border);
  border-radius: 6px;
  font-size: 11px;
  font-family: inherit;
  color: var(--gc-text-secondary);
}

/* Actions */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
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
  transition: all 0.2s;
  color: var(--gc-text-secondary);
}

.icon-btn svg {
  width: 20px;
  height: 20px;
}

.icon-btn:hover {
  background: var(--gc-bg-tertiary);
  border-color: var(--gc-primary);
  color: var(--gc-text-primary);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
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
  transform: translateY(-1px);
}

.user-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  background: linear-gradient(135deg, var(--gc-primary) 0%, #8b5cf6 100%);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.user-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
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
  min-width: 220px;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 14px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
  padding: 8px;
  z-index: 200;
}

.dropdown-right {
  left: auto;
  right: 0;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--gc-primary) 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: var(--gc-text-primary);
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: var(--gc-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: var(--gc-border);
  margin: 6px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
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

.dropdown-item svg {
  width: 18px;
  height: 18px;
  color: var(--gc-text-secondary);
}

.dropdown-item:hover {
  background: var(--gc-bg-tertiary);
}

.dropdown-item:hover svg {
  color: var(--gc-text-primary);
}

.dropdown-item.text-danger {
  color: var(--gc-error);
}

.dropdown-item.text-danger svg {
  color: var(--gc-error);
}

.dropdown-item.text-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .topbar {
    padding: 0 16px;
  }
  
  .logo-text {
    display: none;
  }
  
  .topbar-center {
    padding: 0 16px;
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
