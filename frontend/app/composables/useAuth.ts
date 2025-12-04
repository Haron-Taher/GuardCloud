import { ref, readonly, computed } from 'vue'
import apiClient from '~/utils/apiClient'

// User interface
export interface User {
  id: number
  username: string
  email?: string
  created_at: string
  storage_used?: number
  file_count?: number
}

// Activity interface
export interface Activity {
  id: number
  action: string
  target_type?: string
  target_id?: number
  target_name?: string
  details?: string
  created_at: string
}

// Singleton state
const user = ref<User | null>(null)
const token = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const initialized = ref(false)

export function useAuth() {
  // Initialize from localStorage
  function init() {
    if (initialized.value) return
    
    if (typeof window !== 'undefined') {
      token.value = localStorage.getItem('gc_token')
      const storedUser = localStorage.getItem('gc_user')
      const storedEmail = localStorage.getItem('gc_email')
      
      if (storedUser) {
        user.value = {
          id: 0,
          username: storedUser,
          email: storedEmail || undefined,
          created_at: '',
        }
      }
    }
    
    initialized.value = true
  }

  // Login
  async function login(username: string, password: string) {
    // Validation
    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
      throw new Error('Username is required')
    }
    if (!password) {
      throw new Error('Password is required')
    }

    loading.value = true
    error.value = null

    try {
      const res = await apiClient.post('/auth/login', { username: trimmedUsername, password })
      
      const { token: newToken, username: returnedUsername, email } = res.data
      
      // Store in state and localStorage
      token.value = newToken
      user.value = {
        id: 0,
        username: returnedUsername,
        email: email || undefined,
        created_at: '',
      }
      
      localStorage.setItem('gc_token', newToken)
      localStorage.setItem('gc_user', returnedUsername)
      if (email) {
        localStorage.setItem('gc_email', email)
      }

      return res.data
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { detail?: string } } }
      
      if (axiosError.response?.status === 401) {
        error.value = 'Invalid username or password'
      } else if (axiosError.response?.status === 429) {
        error.value = 'Too many login attempts. Please try again later.'
      } else if (axiosError.response?.data?.detail) {
        error.value = axiosError.response.data.detail
      } else {
        error.value = 'Login failed. Please check your connection.'
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  // Signup
  async function signup(username: string, email: string, password: string) {
    // Validation
    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()
    
    if (!trimmedUsername || trimmedUsername.length < 3) {
      throw new Error('Username must be at least 3 characters')
    }
    
    // Username format validation
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens')
    }
    
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      throw new Error('Invalid email format')
    }
    
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    loading.value = true
    error.value = null

    try {
      const res = await apiClient.post('/auth/signup', {
        username: trimmedUsername,
        email: trimmedEmail || undefined,
        password,
      })
      
      return res.data
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { detail?: string } } }
      
      if (axiosError.response?.status === 409) {
        error.value = 'Username already exists'
      } else if (axiosError.response?.status === 400) {
        error.value = axiosError.response.data?.detail || 'Invalid input'
      } else if (axiosError.response?.data?.detail) {
        error.value = axiosError.response.data.detail
      } else {
        error.value = 'Signup failed. Please check your connection.'
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logout
  function logout() {
    token.value = null
    user.value = null
    
    localStorage.removeItem('gc_token')
    localStorage.removeItem('gc_user')
    localStorage.removeItem('gc_email')
  }

  // Validate session
  async function validateSession(): Promise<boolean> {
    if (!token.value) return false

    try {
      const res = await apiClient.get('/auth/me')
      user.value = res.data
      return true
    } catch {
      // Token is invalid
      logout()
      return false
    }
  }

  // Get current user profile
  async function fetchProfile(): Promise<User | null> {
    try {
      const res = await apiClient.get('/auth/me')
      user.value = res.data
      return res.data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch profile'
      error.value = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || message
      throw err
    }
  }

  // Update profile (email)
  async function updateProfile(email: string) {
    try {
      await apiClient.put('/auth/profile', { email: email.trim() || null })
      
      if (user.value) {
        user.value.email = email.trim() || undefined
      }
      
      if (email.trim()) {
        localStorage.setItem('gc_email', email.trim())
      } else {
        localStorage.removeItem('gc_email')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      error.value = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || message
      throw err
    }
  }

  // Change password
  async function changePassword(currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new Error('Both current and new password are required')
    }
    
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters')
    }

    try {
      await apiClient.put('/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { detail?: string } } }
      
      if (axiosError.response?.status === 401) {
        error.value = 'Current password is incorrect'
      } else if (axiosError.response?.data?.detail) {
        error.value = axiosError.response.data.detail
      } else {
        error.value = 'Failed to change password'
      }
      
      throw err
    }
  }

  // Get activity log
  async function fetchActivity(limit = 50): Promise<Activity[]> {
    try {
      const res = await apiClient.get(`/activity?limit=${limit}`)
      return res.data.activities || []
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch activity'
      error.value = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || message
      throw err
    }
  }

  // Check if logged in
  function isLoggedIn(): boolean {
    return !!token.value
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  // Initialize on first use
  init()

  // Computed auth state for backward compatibility
  const authState = computed(() => ({
    isAuthenticated: !!token.value,
    username: user.value?.username || null,
    email: user.value?.email || null,
    user: user.value
  }))

  return {
    // State (readonly)
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    error: readonly(error),
    authState,

    // Actions
    login,
    signup,
    logout,
    validateSession,
    fetchProfile,
    updateProfile,
    changePassword,
    fetchActivity,
    isLoggedIn,
    clearError,
  }
}
