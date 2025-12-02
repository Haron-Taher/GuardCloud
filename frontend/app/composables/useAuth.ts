import { reactive, computed } from 'vue'
import api from '~/utils/apiClient'

type AuthState = {
  token: string
  username: string
}

const authState = reactive<AuthState>({
  token: '',
  username: ''
})

if (process.client) {
  const storedToken = localStorage.getItem('gc_token')
  const storedUser = localStorage.getItem('gc_user')

  if (storedToken && storedUser) {
    authState.token = storedToken
    authState.username = storedUser
  }
}

export function useAuthState() {
  const isLoggedIn = computed(() => !!authState.token)

  async function login(username: string, password: string) {
    const res = await api.post('/auth/login', {
      username,
      password
    })

    const token = res.data.token as string

    authState.token = token
    authState.username = username

    if (process.client) {
      localStorage.setItem('gc_token', token)
      localStorage.setItem('gc_user', username)
    }
  }

  async function signup(username: string, password: string, email: string) {
    await api.post('/auth/signup', {
      username,
      password,
      email
    })
    // decide in the component whether to auto-login or redirect to /login
  }

  function logout() {
    authState.token = ''
    authState.username = ''

    if (process.client) {
      localStorage.removeItem('gc_token')
      localStorage.removeItem('gc_user')
    }
  }

  return {
    authState,
    isLoggedIn,
    login,
    signup,
    logout
  }
}
