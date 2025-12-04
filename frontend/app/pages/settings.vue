<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useTheme } from '~/composables/useTheme'
import { useFiles } from '~/composables/useFiles'
import { formatFileSize } from '~/utils/fileIcons'

const router = useRouter()
const { authState, user, fetchProfile, updateProfile, changePassword, logout } = useAuth()
const { theme, isDark, setTheme, init: initTheme } = useTheme()
const { storageStats, fetchStorageStats } = useFiles()

const loading = ref(false)
const message = ref({ type: '', text: '' })

// Profile form
const email = ref('')

// Password form
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')

onMounted(async () => {
  initTheme()
  
  if (!authState.value.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    await fetchProfile()
    email.value = user.value?.email || ''
    await fetchStorageStats()
  } catch (e) {
    console.error('Failed to load profile:', e)
  }
})

async function saveProfile() {
  loading.value = true
  message.value = { type: '', text: '' }

  try {
    await updateProfile(email.value)
    message.value = { type: 'success', text: 'Profile updated successfully' }
  } catch (e: any) {
    message.value = { type: 'error', text: e?.response?.data?.detail || 'Failed to update profile' }
  } finally {
    loading.value = false
  }
}

async function savePassword() {
  if (newPassword.value !== confirmNewPassword.value) {
    message.value = { type: 'error', text: 'New passwords do not match' }
    return
  }

  if (newPassword.value.length < 8) {
    message.value = { type: 'error', text: 'Password must be at least 8 characters' }
    return
  }

  loading.value = true
  message.value = { type: '', text: '' }

  try {
    await changePassword(currentPassword.value, newPassword.value)
    message.value = { type: 'success', text: 'Password changed successfully' }
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
  } catch (e: any) {
    message.value = { type: 'error', text: e?.response?.data?.detail || 'Failed to change password' }
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  logout()
  router.push('/login')
}

function goBack() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="settings-page">
    <!-- Header -->
    <header class="settings-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Dashboard
      </button>
      <h1>Settings</h1>
    </header>

    <div class="settings-content">
      <!-- Message -->
      <div v-if="message.text" :class="['message', message.type]">
        {{ message.text }}
        <button @click="message = { type: '', text: '' }">×</button>
      </div>

      <!-- Profile Section -->
      <section class="settings-section">
        <h2>Profile</h2>
        <div class="section-content">
          <div class="info-row">
            <span class="info-label">Username</span>
            <span class="info-value">{{ user?.username }}</span>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="form-input"
            />
          </div>

          <button class="btn btn-primary" @click="saveProfile" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </section>

      <!-- Password Section -->
      <section class="settings-section">
        <h2>Change Password</h2>
        <div class="section-content">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              v-model="currentPassword"
              type="password"
              placeholder="Enter current password"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              placeholder="Enter new password"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="confirmNewPassword">Confirm New Password</label>
            <input
              id="confirmNewPassword"
              v-model="confirmNewPassword"
              type="password"
              placeholder="Confirm new password"
              class="form-input"
            />
          </div>

          <button 
            class="btn btn-primary" 
            @click="savePassword" 
            :disabled="loading || !currentPassword || !newPassword"
          >
            {{ loading ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </section>

      <!-- Appearance Section -->
      <section class="settings-section">
        <h2>Appearance</h2>
        <div class="section-content">
          <div class="theme-options">
            <button 
              :class="['theme-option', { active: theme === 'light' }]"
              @click="setTheme('light')"
            >
              <span class="theme-icon">☀️</span>
              <span class="theme-label">Light</span>
            </button>
            <button 
              :class="['theme-option', { active: theme === 'dark' }]"
              @click="setTheme('dark')"
            >
              <span class="theme-icon">🌙</span>
              <span class="theme-label">Dark</span>
            </button>
            <button 
              :class="['theme-option', { active: theme === 'system' }]"
              @click="setTheme('system')"
            >
              <span class="theme-icon">💻</span>
              <span class="theme-label">System</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Storage Section -->
      <section class="settings-section">
        <h2>Storage</h2>
        <div class="section-content">
          <div class="storage-info">
            <div class="storage-bar">
              <div 
                class="storage-fill" 
                :style="{ width: `${storageStats?.percentage || 0}%` }"
                :class="{ warning: (storageStats?.percentage || 0) > 80 }"
              ></div>
            </div>
            <div class="storage-text">
              <span>{{ formatFileSize(storageStats?.used || 0) }} used</span>
              <span>{{ formatFileSize(storageStats?.limit || 0) }} total</span>
            </div>
            <div class="storage-details">
              <div class="detail-item">
                <span class="detail-label">Files</span>
                <span class="detail-value">{{ storageStats?.file_count || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Available</span>
                <span class="detail-value">{{ formatFileSize(storageStats?.available || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="settings-section danger">
        <h2>Account</h2>
        <div class="section-content">
          <button class="btn btn-danger" @click="handleLogout">
            Sign Out
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--gc-bg-secondary);
}

.settings-header {
  background: var(--gc-bg-primary);
  border-bottom: 1px solid var(--gc-border);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--gc-text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.settings-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.settings-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 24px;
  font-size: 14px;
}

.message.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--gc-success);
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--gc-error);
}

.message button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
}

.message button:hover {
  opacity: 1;
}

.settings-section {
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
}

.settings-section h2 {
  margin: 0;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--gc-text-primary);
  border-bottom: 1px solid var(--gc-border);
  background: var(--gc-bg-secondary);
}

.settings-section.danger h2 {
  color: var(--gc-error);
}

.section-content {
  padding: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--gc-border);
  margin-bottom: 16px;
}

.info-label {
  font-size: 14px;
  color: var(--gc-text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--gc-text-primary);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--gc-text-primary);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--gc-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--gc-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger {
  background: var(--gc-error);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Theme options */
.theme-options {
  display: flex;
  gap: 12px;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--gc-bg-secondary);
  border: 2px solid var(--gc-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-option:hover {
  border-color: var(--gc-primary);
}

.theme-option.active {
  border-color: var(--gc-primary);
  background: rgba(99, 102, 241, 0.1);
}

.theme-icon {
  font-size: 28px;
}

.theme-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--gc-text-primary);
}

/* Storage */
.storage-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.storage-bar {
  height: 8px;
  background: var(--gc-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  background: var(--gc-primary);
  border-radius: 4px;
  transition: width 0.3s;
}

.storage-fill.warning {
  background: var(--gc-warning);
}

.storage-text {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--gc-text-secondary);
}

.storage-details {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid var(--gc-border);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: var(--gc-text-secondary);
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--gc-text-primary);
}
</style>
