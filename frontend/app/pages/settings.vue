<template>
  <div class="settings-page">
    <header class="settings-header">
      <NuxtLink to="/dashboard" class="back-link">
        <span>←</span> Back to Drive
      </NuxtLink>
      <h1>Settings</h1>
    </header>

    <div class="settings-content">
      <!-- Profile Section -->
      <section class="settings-section">
        <h2>Profile</h2>
        
        <div class="form-group">
          <label>Username</label>
          <input
            type="text"
            :value="authState.user?.username"
            disabled
            class="form-input disabled"
          />
          <p class="form-hint">Username cannot be changed</p>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="form-input"
          />
        </div>

        <button class="btn btn-primary" @click="updateProfile" :disabled="updating">
          {{ updating ? 'Saving...' : 'Save Changes' }}
        </button>

        <Transition name="fade">
          <div v-if="profileMessage" :class="['message', profileSuccess ? 'success' : 'error']">
            {{ profileMessage }}
          </div>
        </Transition>
      </section>

      <!-- Password Section -->
      <section class="settings-section">
        <h2>Change Password</h2>

        <div class="form-group">
          <label>Current Password</label>
          <input
            v-model="currentPassword"
            type="password"
            placeholder="Enter current password"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>New Password</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="Enter new password"
            class="form-input"
          />
          <div v-if="newPassword" class="password-strength">
            <div class="strength-bar">
              <div class="strength-fill" :style="{ width: passwordStrength.percent + '%' }" :class="passwordStrength.class"></div>
            </div>
            <span class="strength-text" :class="passwordStrength.class">{{ passwordStrength.label }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            class="form-input"
            :class="{ error: confirmPassword && confirmPassword !== newPassword }"
          />
          <p v-if="confirmPassword && confirmPassword !== newPassword" class="form-error">
            Passwords don't match
          </p>
        </div>

        <button
          class="btn btn-primary"
          @click="changePassword"
          :disabled="changingPassword || !canChangePassword"
        >
          {{ changingPassword ? 'Changing...' : 'Change Password' }}
        </button>

        <Transition name="fade">
          <div v-if="passwordMessage" :class="['message', passwordSuccess ? 'success' : 'error']">
            {{ passwordMessage }}
          </div>
        </Transition>
      </section>

      <!-- Storage Section -->
      <section class="settings-section">
        <h2>Storage</h2>

        <div class="storage-stats">
          <div class="stat-row">
            <span>Used Space</span>
            <span class="stat-value">{{ formatSize(storageUsed) }}</span>
          </div>
          <div class="stat-row">
            <span>Available Space</span>
            <span class="stat-value">{{ formatSize(storageLimit - storageUsed) }}</span>
          </div>
          <div class="stat-row">
            <span>Total Files</span>
            <span class="stat-value">{{ fileCount }}</span>
          </div>
          
          <div class="storage-visual">
            <div class="storage-bar">
              <div class="storage-used" :style="{ width: storagePercent + '%' }"></div>
            </div>
            <div class="storage-labels">
              <span>{{ storagePercent }}% used</span>
              <span>{{ formatSize(storageLimit) }} total</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Account Section -->
      <section class="settings-section">
        <h2>Account</h2>

        <div class="account-info">
          <div class="info-row">
            <span>Member since</span>
            <span class="info-value">{{ formatDate(authState.user?.created_at) }}</span>
          </div>
        </div>

        <div class="danger-zone">
          <h3>Danger Zone</h3>
          <p>Once you delete your account, there is no going back. Please be certain.</p>
          <button class="btn btn-danger" @click="showDeleteAccountModal = true">
            Delete Account
          </button>
        </div>
      </section>
    </div>

    <!-- Delete Account Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteAccountModal" class="modal-overlay" @click.self="showDeleteAccountModal = false">
          <div class="modal">
            <h3>Delete Account?</h3>
            <p class="modal-warning">
              This will permanently delete your account and all associated files. This action cannot be undone.
            </p>
            <p>Type your username <strong>{{ authState.user?.username }}</strong> to confirm:</p>
            <input
              v-model="deleteConfirmation"
              type="text"
              placeholder="Enter username"
              class="form-input"
            />
            <div class="modal-actions">
              <button class="btn btn-ghost" @click="showDeleteAccountModal = false">Cancel</button>
              <button
                class="btn btn-danger"
                :disabled="deleteConfirmation !== authState.user?.username"
                @click="deleteAccount"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useFiles } from '~/composables/useFiles'
import { formatFileSize } from '~/utils/fileIcons'

const router = useRouter()
const auth = useAuth()
const files = useFiles()

// State
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const updating = ref(false)
const profileMessage = ref('')
const profileSuccess = ref(false)

const changingPassword = ref(false)
const passwordMessage = ref('')
const passwordSuccess = ref(false)

const storageUsed = ref(0)
const storageLimit = ref(15 * 1024 * 1024 * 1024)
const fileCount = ref(0)

const showDeleteAccountModal = ref(false)
const deleteConfirmation = ref('')

// Auth state
const authState = computed(() => ({
  user: auth.user.value,
}))

// Computed
const storagePercent = computed(() => {
  if (storageLimit.value === 0) return 0
  return Math.round((storageUsed.value / storageLimit.value) * 100)
})

const passwordStrength = computed(() => {
  const password = newPassword.value
  if (!password) return { percent: 0, label: '', class: '' }
  
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  
  const levels = [
    { percent: 20, label: 'Very weak', class: 'very-weak' },
    { percent: 40, label: 'Weak', class: 'weak' },
    { percent: 60, label: 'Fair', class: 'fair' },
    { percent: 80, label: 'Good', class: 'good' },
    { percent: 100, label: 'Strong', class: 'strong' },
  ]
  
  return levels[Math.min(score, 4)]
})

const canChangePassword = computed(() => {
  return (
    currentPassword.value &&
    newPassword.value &&
    newPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value
  )
})

// Methods
function formatSize(bytes: number) {
  return formatFileSize(bytes)
}

function formatDate(timestamp: string | undefined) {
  if (!timestamp) return 'Unknown'
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function updateProfile() {
  updating.value = true
  profileMessage.value = ''
  
  try {
    await auth.updateProfile(email.value)
    profileMessage.value = 'Profile updated successfully'
    profileSuccess.value = true
    
    setTimeout(() => {
      profileMessage.value = ''
    }, 3000)
  } catch (err) {
    profileMessage.value = err instanceof Error ? err.message : 'Failed to update profile'
    profileSuccess.value = false
  } finally {
    updating.value = false
  }
}

async function changePassword() {
  if (!canChangePassword.value) return
  
  changingPassword.value = true
  passwordMessage.value = ''
  
  try {
    await auth.changePassword(currentPassword.value, newPassword.value)
    passwordMessage.value = 'Password changed successfully'
    passwordSuccess.value = true
    
    // Clear form
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    
    setTimeout(() => {
      passwordMessage.value = ''
    }, 3000)
  } catch (err) {
    passwordMessage.value = err instanceof Error ? err.message : 'Failed to change password'
    passwordSuccess.value = false
  } finally {
    changingPassword.value = false
  }
}

async function fetchStorageStats() {
  try {
    const stats = await files.fetchStorageStats()
    if (stats) {
      storageUsed.value = stats.used
      storageLimit.value = stats.limit
      fileCount.value = stats.file_count
    }
  } catch {
    // Silently fail
  }
}

async function deleteAccount() {
  // TODO: Implement account deletion endpoint
  alert('Account deletion is not yet implemented')
  showDeleteAccountModal.value = false
}

// Lifecycle
onMounted(async () => {
  // Load profile
  try {
    const profile = await auth.fetchProfile()
    if (profile) {
      email.value = profile.email || ''
    }
  } catch {
    // Redirect to login if not authenticated
    router.push('/login')
  }
  
  // Load storage stats
  await fetchStorageStats()
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--gc-bg);
}

.settings-header {
  background: var(--gc-surface);
  border-bottom: 1px solid var(--gc-border);
  padding: 1rem 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gc-text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.back-link:hover {
  color: var(--gc-text);
}

.settings-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.settings-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-section {
  background: var(--gc-surface);
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.settings-section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gc-border);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--gc-text);
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--gc-bg);
  color: var(--gc-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input.disabled {
  background: var(--gc-border);
  cursor: not-allowed;
  opacity: 0.7;
}

.form-input.error {
  border-color: var(--gc-error);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--gc-text-muted);
  margin-top: 0.25rem;
}

.form-error {
  font-size: 0.75rem;
  color: var(--gc-error);
  margin-top: 0.25rem;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: var(--gc-border);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-fill.very-weak { background: #ef4444; }
.strength-fill.weak { background: #f97316; }
.strength-fill.fair { background: #eab308; }
.strength-fill.good { background: #22c55e; }
.strength-fill.strong { background: #10b981; }

.strength-text {
  font-size: 0.75rem;
}

.strength-text.very-weak { color: #ef4444; }
.strength-text.weak { color: #f97316; }
.strength-text.fair { color: #eab308; }
.strength-text.good { color: #22c55e; }
.strength-text.strong { color: #10b981; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--gc-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--gc-primary-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--gc-text);
}

.btn-ghost:hover {
  background: var(--gc-bg);
}

.btn-danger {
  background: var(--gc-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.message.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--gc-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Storage Stats */
.storage-stats {
  padding: 0.5rem 0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.stat-value {
  font-weight: 500;
}

.storage-visual {
  margin-top: 1rem;
}

.storage-bar {
  height: 8px;
  background: var(--gc-border);
  border-radius: 4px;
  overflow: hidden;
}

.storage-used {
  height: 100%;
  background: var(--gc-primary);
  transition: width 0.3s ease;
}

.storage-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--gc-text-muted);
}

/* Account Info */
.account-info {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.info-value {
  color: var(--gc-text-muted);
}

/* Danger Zone */
.danger-zone {
  border-top: 1px solid var(--gc-border);
  padding-top: 1rem;
  margin-top: 1rem;
}

.danger-zone h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gc-error);
  margin-bottom: 0.5rem;
}

.danger-zone p {
  font-size: 0.875rem;
  color: var(--gc-text-muted);
  margin-bottom: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--gc-surface);
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
}

.modal h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.modal-warning {
  color: var(--gc-error);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .settings-content {
    padding: 1rem;
  }
}
</style>
