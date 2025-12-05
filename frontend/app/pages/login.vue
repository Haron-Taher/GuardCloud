<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useTheme } from '~/composables/useTheme'

const router = useRouter()
const route = useRoute()
const { login, authState } = useAuth()
const { isDark, toggleTheme, init: initTheme } = useTheme()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const sessionExpired = ref(false)

// Check for session expiration message
onMounted(() => {
  initTheme()
  
  if (route.query.expired === 'true') {
    sessionExpired.value = true
    router.replace({ path: '/login', query: {} })
  }
  
  if (authState.value.isAuthenticated) {
    router.push('/dashboard')
  }
})

const onSubmit = async () => {
  if (loading.value) return
  
  error.value = ''
  sessionExpired.value = false
  
  if (!username.value.trim()) {
    error.value = 'Please enter your username'
    return
  }
  
  if (!password.value) {
    error.value = 'Please enter your password'
    return
  }

  loading.value = true

  try {
    await login(username.value, password.value)
    const redirectTo = (route.query.redirect as string) || '/dashboard'
    router.push(redirectTo)
  } catch (e: any) {
    if (e?.response?.status === 401) {
      error.value = 'Invalid username or password'
    } else if (e?.response?.status === 429) {
      error.value = 'Too many login attempts. Please try again later.'
    } else if (e?.response?.status >= 500) {
      error.value = 'Server error. Please try again later.'
    } else if (!e?.response) {
      error.value = 'Network error. Please check your connection.'
    } else {
      error.value = e?.response?.data?.detail || e?.message || 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !loading.value) {
    onSubmit()
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
        <div class="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <!-- Session expired notice -->
        <div v-if="sessionExpired" class="auth-notice warning">
          <span>⚠️</span>
          <span>Your session has expired. Please sign in again.</span>
        </div>

        <form @submit.prevent="onSubmit" @keydown="handleKeydown" class="auth-form">
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
                placeholder="Enter your username"
                required
                autocomplete="username"
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
                placeholder="Enter your password"
                required
                autocomplete="current-password"
                :disabled="loading"
                class="form-input"
              />
            </div>
          </div>

          <div v-if="error" class="auth-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ error }}</span>
          </div>

          <button type="submit" :disabled="loading" class="btn-submit">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="auth-footer">
          <span>Don't have an account?</span>
          <NuxtLink to="/signup">Create one</NuxtLink>
        </div>
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

.auth-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 20px;
}

.auth-notice.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #b45309;
}

[data-theme="dark"] .auth-notice.warning {
  color: #fbbf24;
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
</style>
