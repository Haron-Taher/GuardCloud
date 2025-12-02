<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthState } from '~/composables/useAuth'
import { GcButton, GcInput, GcCard } from '~/components/ui'
import IconUser from '~/components/icons/IconUser.vue'
import IconMail from '~/components/icons/IconMail.vue'
import IconLock from '~/components/icons/IconLock.vue'

const router = useRouter()
const { signup } = useAuthState()

const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = ''

  try {
    await signup(username.value, password.value, email.value)
    router.push('/login')
  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Signup failed. Please try again.'
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
          />

          <GcInput
            v-model="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            :icon="IconMail"
            required
            autocomplete="email"
          />

          <GcInput
            v-model="password"
            type="password"
            label="Password"
            placeholder="Create a strong password"
            hint="At least 12 characters with uppercase, lowercase, number, and special character"
            :icon="IconLock"
            required
            autocomplete="new-password"
          />

          <Transition name="fade">
            <p v-if="error" class="auth-error">{{ error }}</p>
          </Transition>

          <GcButton type="submit" variant="primary" size="lg" :loading="loading" class="auth-submit">
            Create account
          </GcButton>
        </form>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <NuxtLink to="/login">Sign in</NuxtLink>
        </div>
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
  margin-bottom: 28px;
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

.auth-error {
  margin: 0;
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--gc-radius-md);
  color: var(--gc-error);
  font-size: 13px;
  text-align: center;
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
