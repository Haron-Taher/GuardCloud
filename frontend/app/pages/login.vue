<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { login, authState } = useAuth()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const sessionExpired = ref(false)

// Check for session expiration message
onMounted(() => {
  if (route.query.expired === 'true') {
    sessionExpired.value = true
    // Clean up URL
    router.replace({ path: '/login', query: {} })
  }
  
  // Redirect if already logged in
  if (authState.value.isAuthenticated) {
    router.push('/dashboard')
  }
})

const onSubmit = async () => {
  // Prevent double submission
  if (loading.value) return
  
  // Clear previous errors
  error.value = ''
  sessionExpired.value = false
  
  // Basic validation
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
    
    // Redirect to dashboard on success
    const redirectTo = (route.query.redirect as string) || '/dashboard'
    router.push(redirectTo)
  } catch (e: any) {
    // Handle specific error cases
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

// Handle Enter key in form
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !loading.value) {
    onSubmit()
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Logo -->
      <NuxtLink to="/" class="auth-logo">
        <span class="logo-icon">☁️</span>
        <span>GuardCloud</span>
      </NuxtLink>

      <!-- Card -->
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <!-- Session expired notice -->
        <div v-if="sessionExpired" class="auth-notice auth-notice--warning">
          <span>⚠️</span>
          <span>Your session has expired. Please sign in again.</span>
        </div>

        <form @submit.prevent="onSubmit" @keydown="handleKeydown" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
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

          <div class="form-group">
            <label for="password">Password</label>
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

          <div v-if="error" class="auth-error">
            <span>{{ error }}</span>
          </div>

          <button type="submit" :disabled="loading" class="btn btn-primary auth-submit">
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
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 700;
  color: var(--gc-text-primary);
  text-decoration: none;
}

.logo-icon {
  font-size: 32px;
}

.auth-card {
  background: var(--gc-bg-primary);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--gc-text-primary);
}

.auth-header p {
  font-size: 14px;
  color: var(--gc-text-secondary);
  margin: 0;
}

.auth-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}

.auth-notice--warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #b45309;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--gc-text-primary);
}

.form-input {
  padding: 12px 14px;
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--gc-primary);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: var(--gc-error);
  font-size: 13px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
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

.auth-submit {
  width: 100%;
  margin-top: 4px;
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
}

.auth-back:hover {
  color: var(--gc-primary);
}
</style>
