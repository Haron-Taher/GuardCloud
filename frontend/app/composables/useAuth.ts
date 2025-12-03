import { reactive, computed, readonly } from 'vue'
import api from '~/utils/apiClient'

interface AuthState {
  token: string
  username: string
  email: string
  initialized: boolean
}

// Singleton state - shared across all components
const authState = reactive<AuthState>({
  token: '',
  username: '',
  email: '',
  initialized: false,
})

// Initialize from localStorage on client
function initializeAuth() {
  if (process.client && !authState.initialized) {
    const storedToken = localStorage.getItem('gc_token')
    const storedUser = localStorage.getItem('gc_user')
    const storedEmail = localStorage.getItem('gc_email')

    if (storedToken && storedUser) {
      authState.token = storedToken
      authState.username = storedUser
      authState.email = storedEmail || ''
    }
    
    authState.initialized = true
  }
}

// Initialize immediately if on client
if (process.client) {
  initializeAuth()
}

export function useAuthState() {
  // Ensure initialized
  initializeAuth()
  
  const isLoggedIn = computed(() => !!authState.token)

  async function login(username: string, password: string): Promise<void> {
    // Validate inputs
    if (!username?.trim()) {
      throw new Error('Username is required')
    }
    if (!password) {
      throw new Error('Password is required')
    }

    const res = await api.post('/auth/login', {
      username: username.trim(),
      password,
    })

    const token = res.data.token as string
    const email = res.data.email as string | undefined

    if (!token) {
      throw new Error('Invalid response from server')
    }

    authState.token = token
    authState.username = username.trim()
    authState.email = email || ''

    if (process.client) {
      localStorage.setItem('gc_token', token)
      localStorage.setItem('gc_user', username.trim())
      if (email) {
        localStorage.setItem('gc_email', email)
      }
    }
  }

  async function signup(username: string, password: string, email?: string): Promise<void> {
    // Validate inputs
    if (!username?.trim()) {
      throw new Error('Username is required')
    }
    if (!password) {
      throw new Error('Password is required')
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }
    if (email && !isValidEmail(email)) {
      throw new Error('Invalid email address')
    }

    await api.post('/auth/signup', {
      username: username.trim(),
      password,
      email: email?.trim() || undefined,
    })
  }

  function logout(): void {
    authState.token = ''
    authState.username = ''
    authState.email = ''

    if (process.client) {
      localStorage.removeItem('gc_token')
      localStorage.removeItem('gc_user')
      localStorage.removeItem('gc_email')
    }
  }

  // Check if session is still valid
  async function validateSession(): Promise<boolean> {
    if (!authState.token) return false
    
    try {
      await api.get('/auth/me')
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    authState: readonly(authState),
    isLoggedIn,
    login,
    signup,
    logout,
    validateSession,
  }
}

// Helper function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
