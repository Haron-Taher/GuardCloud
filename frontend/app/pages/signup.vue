<!--
  Signup Page
  
  This meets Functional Requirement #2:
  FR-2: The user SHALL be prompted for a login or create account option.
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useTheme } from '~/composables/useTheme'

const router = useRouter()
const { signup, authState } = useAuth()
const { isDark, toggleTheme, init: initTheme } = useTheme()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(() => {
  initTheme()
  
  if (authState.value.isAuthenticated) {
    router.push('/dashboard')
  }
})

// Password strength indicator
const passwordStrength = computed(() => {
  const pwd = password.value
  if (!pwd) return { score: 0, label: '', color: '' }
  
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  
  const levels = [
    { label: 'Very weak', color: '#ef4444' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#eab308' },
    { label: 'Good', color: '#84cc16' },
    { label: 'Strong', color: '#22c55e' },
  ]
  
  return { score, ...levels[Math.min(score, 4)] }
})

const canSubmit = computed(() => {
  return (
    username.value.trim().length >= 3 &&
    password.value.length >= 8 &&
    password.value === confirmPassword.value
  )
})

const onSubmit = async () => {
  if (loading.value || !canSubmit.value) return
  
  error.value = ''
  loading.value = true

  try {
    await signup(username.value, email.value, password.value)
    success.value = true
    
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (e: any) {
    if (e?.response?.status === 409) {
      error.value = 'Username already exists'
    } else if (e?.response?.status === 400) {
      error.value = e?.response?.data?.detail || 'Invalid input. Please check your details.'
    } else if (e?.response?.status >= 500) {
      error.value = 'Server error. Please try again later.'
    } else if (!e?.response) {
      error.value = 'Network error. Please check your connection.'
    } else {
      error.value = e?.response?.data?.detail || e?.message || 'Signup failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <!-- Theme Toggle -->
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
      <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>

    <div class="auth-container">
      <!-- Logo -->
      <NuxtLink to="/" class="auth-logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"/>
        </svg>
        <span>GuardCloud</span>
      </NuxtLink>

      <!-- Card -->
      <div class="auth-card">
        <!-- Success state -->
        <div v-if="success" class="auth-success">
          <div class="success-icon">✓</div>
          <h2>Account created!</h2>
          <p>Redirecting you to sign in...</p>
        </div>

        <!-- Form -->
        <template v-else>
          <div class="auth-header">
            <h1>Create your account</h1>
            <p>Start securing your files today</p>
          </div>

          <form @submit.prevent="onSubmit" class="auth-form">
            <div class="form-group">
              <label for="username">Username</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  placeholder="Choose a username"
                  required
                  autocomplete="username"
                  :disabled="loading"
                  class="form-input"
                />
              </div>
              <span v-if="username && username.length < 3" class="field-hint error">
                At least 3 characters required
              </span>
            </div>

            <div class="form-group">
              <label for="email">Email <span class="optional">(optional)</span></label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  :disabled="loading"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  autocomplete="new-password"
                  :disabled="loading"
                  class="form-input"
                />
              </div>
              
              <!-- Password strength indicator -->
              <div v-if="password" class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :style="{ 
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      background: passwordStrength.color 
                    }"
                  ></div>
                </div>
                <span class="strength-label" :style="{ color: passwordStrength.color }">
                  {{ passwordStrength.label }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  autocomplete="new-password"
                  :disabled="loading"
                  class="form-input"
                />
              </div>
              <span v-if="confirmPassword && password !== confirmPassword" class="field-hint error">
                Passwords do not match
              </span>
            </div>

            <div v-if="error" class="auth-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ error }}</span>
            </div>

            <button type="submit" :disabled="loading || !canSubmit" class="btn-submit">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </form>

          <div class="auth-footer">
            <span>Already have an account?</span>
            <NuxtLink to="/login">Sign in</NuxtLink>
          </div>
        </template>
      </div>

      <!-- Back to home -->
      <NuxtLink to="/" class="auth-back">
        ← Back to home
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--gc-bg-secondary);
  position: relative;
}

.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--gc-border);
  background: var(--gc-bg-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--gc-text-secondary);
}

.theme-toggle svg {
  width: 20px;
  height: 20px;
}

.theme-toggle:hover {
  background: var(--gc-bg-tertiary);
  border-color: var(--gc-primary);
  color: var(--gc-text-primary);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: var(--gc-text-primary);
  text-decoration: none;
}

.logo-icon {
  width: 36px;
  height: 36px;
  color: var(--gc-primary);
}

.auth-card {
  background: var(--gc-bg-primary);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--gc-shadow-lg);
  border: 1px solid var(--gc-border);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-header h1 {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--gc-text-primary);
}

.auth-header p {
  font-size: 15px;
  color: var(--gc-text-secondary);
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--gc-text-primary);
}

.optional {
  font-weight: 400;
  color: var(--gc-text-secondary);
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--gc-text-secondary);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 14px 14px 14px 46px;
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 15px;
  transition: all 0.2s;
}

.form-input::placeholder {
  color: var(--gc-text-secondary);
}

.form-input:hover {
  border-color: var(--gc-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  background: var(--gc-bg-primary);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-hint {
  font-size: 12px;
  color: var(--gc-text-secondary);
}

.field-hint.error {
  color: var(--gc-error);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--gc-border);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-label {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: var(--gc-error);
  font-size: 14px;
}

.auth-error svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  background: var(--gc-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}

.btn-submit:hover:not(:disabled) {
  background: var(--gc-primary-hover);
  transform: translateY(-1px);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--gc-border);
  font-size: 14px;
  color: var(--gc-text-secondary);
}

.auth-footer a {
  color: var(--gc-primary);
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.auth-back {
  display: flex;
  justify-content: center;
  font-size: 14px;
  color: var(--gc-text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.auth-back:hover {
  color: var(--gc-primary);
}

/* Success state */
.auth-success {
  text-align: center;
  padding: 24px 0;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--gc-success);
  color: #fff;
  border-radius: 50%;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
}

.auth-success h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--gc-text-primary);
}

.auth-success p {
  color: var(--gc-text-secondary);
  margin: 0;
}
</style>
