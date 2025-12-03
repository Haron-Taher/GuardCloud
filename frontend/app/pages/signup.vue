<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { signup, authState } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

// Redirect if already logged in
onMounted(() => {
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

// Validation
const validationErrors = computed(() => {
  const errors: string[] = []
  
  if (username.value && username.value.length < 3) {
    errors.push('Username must be at least 3 characters')
  }
  
  if (username.value && !/^[a-zA-Z0-9_-]+$/.test(username.value)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens')
  }
  
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.push('Please enter a valid email address')
  }
  
  if (password.value && password.value.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    errors.push('Passwords do not match')
  }
  
  return errors
})

const canSubmit = computed(() => {
  return (
    username.value.trim().length >= 3 &&
    password.value.length >= 8 &&
    password.value === confirmPassword.value &&
    validationErrors.value.length === 0
  )
})

const onSubmit = async () => {
  // Prevent double submission
  if (loading.value || !canSubmit.value) return
  
  // Clear previous errors
  error.value = ''

  loading.value = true

  try {
    await signup(username.value, email.value, password.value)
    success.value = true
    
    // Redirect to login after brief delay
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (e: any) {
    // Handle specific error cases
    if (e?.response?.status === 409) {
      error.value = 'Username or email already exists'
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
    <div class="auth-container">
      <!-- Logo -->
      <NuxtLink to="/" class="auth-logo">
        <span class="logo-icon">☁️</span>
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
              <span v-if="username && username.length < 3" class="field-error">
                At least 3 characters required
              </span>
            </div>

            <div class="form-group">
              <label for="email">Email (optional)</label>
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

            <div class="form-group">
              <label for="password">Password</label>
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
              <span v-if="confirmPassword && password !== confirmPassword" class="field-error">
                Passwords do not match
              </span>
            </div>

            <div v-if="error" class="auth-error">
              <span>{{ error }}</span>
            </div>

            <button 
              type="submit" 
              :disabled="loading || !canSubmit"
              class="btn btn-primary auth-submit"
            >
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

.field-error {
  font-size: 12px;
  color: var(--gc-error);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
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
