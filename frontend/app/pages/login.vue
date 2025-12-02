<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthState } from '~/composables/useAuth'

import LoginCard from '~/components/login/logincard.vue'
import UsernameField from '~/components/auth/usernamefield.vue'
import PasswordField from '~/components/auth/passwordfield.vue'
import LoginButton from '~/components/login/loginbutton.vue'
import ToSignup from '~/components/login/tosignup.vue'

const router = useRouter()

const { authState, isLoggedIn, login } = useAuthState()

const username = ref('')
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
    await login(username.value, password.value)

    if (isLoggedIn.value && authState.token)
    {
      router.push('/dashboard')
    }
    else
    {
      error.value = 'Invalid username or password'
    }
  }
  catch (e: any)
  {
    error.value = e?.response?.data?.detail || 'Login failed'
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
      <LoginCard>
        <form class="modern-form" @submit.prevent="onSubmit">
          <div class="form-title">Login</div>

          <div class="form-body">
            <UsernameField v-model="username" />
            <PasswordField v-model="password" />
          </div>

          <LoginButton :disabled="loading" />

          <p v-if="error" class="err">{{ error }}</p>

          <ToSignup />
        </form>
      </LoginCard>
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
