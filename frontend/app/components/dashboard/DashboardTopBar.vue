<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { GcButton } from '~/components/ui'

interface Props {
  username?: string
  email?: string
}

const props = withDefaults(defineProps<Props>(), {
  username: 'User',
  email: '',
})

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'upload'): void
  (e: 'new-folder'): void
  (e: 'logout'): void
}>()

const searchQuery = ref('')
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const initials = computed(() => {
  return props.username.slice(0, 2).toUpperCase()
})

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const handleLogout = () => {
  userMenuOpen.value = false
  emit('logout')
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    userMenuOpen.value = false
  }
}

// Close menu on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <header class="topbar">
    <div class="topbar__inner">
      <!-- Brand -->
      <NuxtLink to="/" class="topbar__brand">
        <img src="~/assets/logos/securecloud.png" width="28" height="28" alt="GuardCloud" />
        <span>GuardCloud</span>
      </NuxtLink>

      <!-- Search -->
      <div class="topbar__search">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21L16.65 16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search files..."
          @input="handleSearch"
        />
        <kbd v-if="!searchQuery" class="search-hint">/</kbd>
      </div>

      <!-- Actions -->
      <div class="topbar__actions">
        <GcButton variant="ghost" size="sm" @click="$emit('new-folder')" class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M12 5V19M5 12H19" />
          </svg>
          <span class="action-label">New</span>
        </GcButton>

        <GcButton variant="primary" size="sm" @click="$emit('upload')" class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" />
            <path d="M17 8L12 3L7 8" />
            <path d="M12 3V15" />
          </svg>
          <span class="action-label">Upload</span>
        </GcButton>

        <!-- User Menu -->
        <div ref="userMenuRef" class="user-menu">
          <button 
            class="user-menu__trigger" 
            @click="toggleUserMenu"
            :aria-expanded="userMenuOpen"
            aria-haspopup="true"
          >
            <span class="user-avatar">{{ initials }}</span>
            <svg 
              class="user-menu__chevron" 
              :class="{ 'user-menu__chevron--open': userMenuOpen }"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
              width="16" 
              height="16"
            >
              <path d="M6 9L12 15L18 9" />
            </svg>
          </button>

          <Transition name="menu">
            <div v-if="userMenuOpen" class="user-menu__dropdown">
              <div class="user-menu__header">
                <span class="user-avatar user-avatar--lg">{{ initials }}</span>
                <div class="user-menu__info">
                  <strong>{{ username }}</strong>
                  <span v-if="email">{{ email }}</span>
                </div>
              </div>

              <div class="user-menu__divider"></div>

              <button class="user-menu__item" @click="userMenuOpen = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Profile</span>
              </button>

              <button class="user-menu__item" @click="userMenuOpen = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                <span>Settings</span>
              </button>

              <div class="user-menu__divider"></div>

              <button class="user-menu__item user-menu__item--danger" @click="handleLogout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" />
                  <path d="M16 17L21 12L16 7" />
                  <path d="M21 12H9" />
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--gc-bg) 92%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--gc-border);
}

.topbar__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.topbar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  color: var(--gc-text);
  text-decoration: none;
}

.topbar__search {
  position: relative;
  max-width: 480px;
  width: 100%;
  justify-self: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--gc-text-muted);
  pointer-events: none;
}

.topbar__search input {
  width: 100%;
  padding: 10px 44px;
  background: var(--gc-card);
  color: var(--gc-text);
  border: 1px solid var(--gc-border);
  border-radius: var(--gc-radius-lg);
  font-size: 14px;
  outline: none;
  transition: all 0.15s;
}

.topbar__search input:focus {
  border-color: var(--gc-accent);
  box-shadow: 0 0 0 3px var(--gc-accent-light);
}

.topbar__search input::placeholder {
  color: var(--gc-text-muted);
}

.search-hint {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  padding: 2px 6px;
  background: var(--gc-border);
  border-radius: 4px;
  font-size: 12px;
  font-family: var(--gc-font-mono, monospace);
  color: var(--gc-text-muted);
  pointer-events: none;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-btn {
  white-space: nowrap;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-menu__trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: var(--gc-radius-lg);
  cursor: pointer;
  transition: background 0.15s;
}

.user-menu__trigger:hover {
  background: var(--gc-card);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gc-accent);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
}

.user-avatar--lg {
  width: 44px;
  height: 44px;
  font-size: 16px;
}

.user-menu__chevron {
  color: var(--gc-text-muted);
  transition: transform 0.2s;
}

.user-menu__chevron--open {
  transform: rotate(180deg);
}

.user-menu__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  background: var(--gc-bg);
  border: 1px solid var(--gc-border);
  border-radius: var(--gc-radius-lg);
  box-shadow: var(--gc-shadow-xl);
  padding: 8px;
  z-index: 100;
}

.user-menu__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.user-menu__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-menu__info strong {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__info span {
  font-size: 13px;
  color: var(--gc-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__divider {
  height: 1px;
  background: var(--gc-border);
  margin: 8px 0;
}

.user-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: var(--gc-radius-md);
  font-size: 14px;
  color: var(--gc-text);
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}

.user-menu__item:hover {
  background: var(--gc-card);
}

.user-menu__item svg {
  color: var(--gc-text-muted);
  flex-shrink: 0;
}

.user-menu__item--danger {
  color: var(--gc-error);
}

.user-menu__item--danger svg {
  color: var(--gc-error);
}

.user-menu__item--danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Menu transition */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.15s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 768px) {
  .topbar__inner {
    grid-template-columns: auto 1fr auto;
    gap: 12px;
  }

  .topbar__brand span {
    display: none;
  }

  .topbar__search {
    max-width: none;
  }

  .action-label {
    display: none;
  }

  .user-menu__chevron {
    display: none;
  }
}
</style>
