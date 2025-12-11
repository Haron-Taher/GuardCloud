<!--
  Settings Page
  
  This meets Functional Requirements #9 and #20:
  FR-9: The user SHALL be able to manage properties of files within the system.
        (Profile and password management are part of user/system properties)
  FR-20: The user SHALL be able to log out and end an authenticated session.
        (Logout button available on this page)
-->

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
      <Transition name="slide-down">
        <div v-if="message.text" :class="['message', message.type]">
          <svg v-if="message.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          <span>{{ message.text }}</span>
          <button @click="message = { type: '', text: '' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </Transition>

      <!-- Profile Section -->
      <section class="settings-section">
        <div class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="section-content">
          <h2>Profile</h2>
          <div class="section-body">
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
        </div>
      </section>

      <!-- Password Section -->
      <section class="settings-section">
        <div class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="section-content">
          <h2>Change Password</h2>
          <div class="section-body">
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
        </div>
      </section>

      <!-- Appearance Section -->
      <section class="settings-section">
        <div class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </div>
        <div class="section-content">
          <h2>Appearance</h2>
          <div class="section-body">
            <div class="theme-options">
              <button 
                :class="['theme-option', { active: theme === 'light' }]"
                @click="setTheme('light')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                <span class="theme-label">Light</span>
              </button>
              <button 
                :class="['theme-option', { active: theme === 'dark' }]"
                @click="setTheme('dark')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span class="theme-label">Dark</span>
              </button>
              <button 
                :class="['theme-option', { active: theme === 'system' }]"
                @click="setTheme('system')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <path d="M8 21h8M12 17v4"/>
                </svg>
                <span class="theme-label">System</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Storage Section -->
      <section class="settings-section">
        <div class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
          </svg>
        </div>
        <div class="section-content">
          <h2>Storage</h2>
          <div class="section-body">
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
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="settings-section danger">
        <div class="section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </div>
        <div class="section-content">
          <h2>Account</h2>
          <div class="section-body">
            <button class="btn btn-danger" @click="handleLogout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sign Out
            </button>
          </div>
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
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: sticky;
  top: 0;
  z-index: 10;
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
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.settings-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.settings-content {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* Animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Message */
.message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
}

.message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.message span {
  flex: 1;
}

.message button {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 4px;
  display: flex;
}

.message button:hover {
  opacity: 1;
}

.message button svg {
  width: 16px;
  height: 16px;
}

.message.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #059669;
}

[data-theme="dark"] .message.success {
  color: #34d399;
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--gc-error);
}

/* Section */
.settings-section {
  display: flex;
  gap: 20px;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.section-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gc-bg-secondary);
  border-radius: 12px;
  flex-shrink: 0;
  color: var(--gc-text-secondary);
}

.section-icon svg {
  width: 22px;
  height: 22px;
}

.section-content {
  flex: 1;
  min-width: 0;
}

.section-content h2 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--gc-text-primary);
}

.settings-section.danger .section-icon {
  background: rgba(239, 68, 68, 0.1);
  color: var(--gc-error);
}

.settings-section.danger h2 {
  color: var(--gc-error);
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--gc-border);
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--gc-text-primary);
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gc-border);
  border-radius: 10px;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.btn svg {
  width: 18px;
  height: 18px;
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
  gap: 10px;
  padding: 18px;
  background: var(--gc-bg-secondary);
  border: 2px solid var(--gc-border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gc-text-secondary);
}

.theme-option svg {
  width: 28px;
  height: 28px;
}

.theme-option:hover {
  border-color: var(--gc-primary);
  color: var(--gc-text-primary);
}

.theme-option.active {
  border-color: var(--gc-primary);
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
}

.theme-label {
  font-size: 14px;
  font-weight: 500;
}

/* Storage */
.storage-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.storage-bar {
  height: 8px;
  background: var(--gc-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gc-primary) 0%, #8b5cf6 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.storage-fill.warning {
  background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
}

.storage-text {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--gc-text-secondary);
}

.storage-details {
  display: flex;
  gap: 32px;
  padding-top: 14px;
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
  font-size: 18px;
  font-weight: 600;
  color: var(--gc-text-primary);
}

/* Responsive */
@media (max-width: 640px) {
  .settings-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .theme-options {
    flex-direction: column;
  }
}
</style>
