<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthState } from '~/composables/useAuth'

import SignupCard from '~/components/signup/signupcard.vue'
import UsernameField from '~/components/auth/usernamefield.vue'
import EmailField from '~/components/auth/emailfield.vue'
import PasswordField from '~/components/auth/passwordfield.vue'
import SignupButton from '~/components/signup/signupbutton.vue'
import ToLogin from '~/components/signup/tologin.vue'

const router = useRouter()

const { signup } = useAuthState()

const username = ref('')
const email = ref('')
const password = ref('')

const loading = ref(false)
const error = ref('')

const onSubmit = async () =>
{
  if (loading.value) return

  loading.value = true
  error.value = ''

  try
  {
    await signup(username.value, password.value, email.value)
    router.push('/login')
  }
  catch (e: any)
  {
    error.value = e?.response?.data?.detail || 'Signup failed'
  }
  finally
  {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth">
    <div class="wrap">
      <SignupCard>
        <form class="modern-form" @submit.prevent="onSubmit">
          <div class="form-title">Sign Up</div>

          <div class="form-body">
            <UsernameField v-model="username" />
            <EmailField v-model="email" />
            <PasswordField v-model="password" />
          </div>

          <SignupButton :disabled="loading" />
          <p v-if="error" class="err">{{ error }}</p>
          
          <ToLogin />
        </form>
      </SignupCard>
    </div>
  </div>
</template>

<style scoped>
.auth
{
  min-height: 100vh;

  display: grid;

  place-items: center;

  background: #f1f5f9;
}

.wrap
{
  width: min(420px, 92vw);
}

.modern-form
{
  --primary: #3b82f6;

  --primary-dark: #2563eb;

  --primary-light: rgba(59, 130, 246, 0.1);

  --success: #10b981;

  --text-main: #1e293b;

  --text-secondary: #64748b;

  --bg-input: #f8fafc;

  position: relative;

  width: 100%;

  padding: 24px;

  background: #ffffff;

  border-radius: 16px;

  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(148, 163, 184, 0.1);
}

.form-title
{
  font-size: 22px;

  font-weight: 600;

  color: var(--text-main);

  margin: 0 0 16px;

  text-align: center;
}

.form-body
{
  display: grid;

  gap: 12px;
}

.err
{
  margin: 10px 0 0 0;

  color: #ef4444;

  font-size: 13px;

  text-align: center;
}
</style>
