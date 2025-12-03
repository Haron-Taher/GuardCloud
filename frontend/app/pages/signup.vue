<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthState } from '~/composables/useAuth'
import { GcButton, GcInput, GcCard } from '~/components/ui'
import IconUser from '~/components/icons/IconUser.vue'
import IconMail from '~/components/icons/IconMail.vue'
import IconLock from '~/components/icons/IconLock.vue'

const router = useRouter()
const { signup, isLoggedIn } = useAuthState()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

// Redirect if already logged in
onMounted(() => {
  if (isLoggedIn.value) {
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
    email.value.trim() &&
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
    await signup(username.value, password.value, email.value)
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
        <img src="~/assets/logos/securecloud.png" width="40" height="40" alt="GuardCloud" />
        <span>GuardCloud</span>
      </NuxtLink>

      <!-- Card -->
      <GcCard variant="elevated" class="auth-card">
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
            <GcInput
              v-model="username"
              label="Username"
              placeholder="Choose a username"
              :icon="IconUser"
              required
              autocomplete="username"
              :disabled="loading"
              :error="username && username.length < 3 ? 'At least 3 characters required' : ''"
            />

            <GcInput
              v-model="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              :icon="IconMail"
              required
              autocomplete="email"
              :disabled="loading"
            />

            <div class="password-field">
              <GcInput
                v-model="password"
                type="password"
                label="Password"
                placeholder="Create a strong password"
                :icon="IconLock"
                required
                autocomplete="new-password"
                :disabled="loading"
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

            <GcInput
              v-model="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              :icon="IconLock"
              required
              autocomplete="new-password"
              :disabled="loading"
              :error="confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''"
            />

            <Transition name="fade">
              <div v-if="error" class="auth-error">
                <span>{{ error }}</span>
              </div>
            </Transition>

            <GcButton 
              type="submit" 
              variant="primary" 
              size="lg" 
              :loading="loading" 
              :disabled="!canSubmit"
              class="auth-submit"
            >
              {{ loading ? 'Creating account...' : 'Create account' }}
            </GcButton>
          </form>

          <div class="auth-footer">
            <span>Already have an account?</span>
            <NuxtLink to="/login">Sign in</NuxtLink>
          </div>
        </template>
      </GcCard>

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
  background: 
    radial-gradient(ellipse at top left, var(--gc-accent-light) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, var(--gc-accent-light) 0%, transparent 50%),
    var(--gc-bg);
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
  color: var(--gc-text);
  text-decoration: none;
}

.auth-card {
  padding: 32px;
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--gc-text);
}

.auth-header p {
  font-size: 14px;
  color: var(--gc-text-muted);
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.password-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  border-radius: var(--gc-radius-full);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: var(--gc-radius-full);
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
  border-radius: var(--gc-radius-md);
  color: var(--gc-error);
  font-size: 13px;
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
  color: var(--gc-text-muted);
}

.auth-footer a {
  color: var(--gc-accent);
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
  color: var(--gc-text-muted);
  text-decoration: none;
}

.auth-back:hover {
  color: var(--gc-accent);
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
}

.auth-success p {
  color: var(--gc-text-muted);
  margin: 0;
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
</style>
