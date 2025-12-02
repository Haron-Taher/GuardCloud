<script setup lang="ts">
import { ref, computed } from 'vue'
import { GcButton } from '~/components/ui'

interface Props {
  username?: string
}

const props = withDefaults(defineProps<Props>(), {
  username: 'User'
})

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'upload'): void
  (e: 'new-folder'): void
  (e: 'logout'): void
}>()

const searchQuery = ref('')

const initials = computed(() => {
  return props.username.slice(0, 2).toUpperCase()
})

const handleSearch = () => {
  emit('search', searchQuery.value)
}
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
      </div>

      <!-- Actions -->
      <div class="topbar__actions">
        <GcButton variant="ghost" size="sm" @click="$emit('new-folder')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M12 5V19M5 12H19" />
          </svg>
          New
        </GcButton>

        <GcButton variant="primary" size="sm" @click="$emit('upload')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" />
            <path d="M17 8L12 3L7 8" />
            <path d="M12 3V15" />
          </svg>
          Upload
        </GcButton>

        <button class="topbar__avatar" @click="$emit('logout')" title="Sign out">
          {{ initials }}
        </button>
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
  padding: 10px 14px 10px 44px;
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

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gc-accent);
  color: #fff;
  border: none;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s;
}

.topbar__avatar:hover {
  transform: scale(1.05);
}

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

  .topbar__actions :deep(.gc-button) span {
    display: none;
  }
}
</style>
