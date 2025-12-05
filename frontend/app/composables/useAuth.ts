import { ref, readonly, computed } from 'vue'
import apiClient from '~/utils/apiClient'
import { cryptoManager, arrayBufferToBase64, base64ToArrayBuffer, exportKey, importKey } from '~/utils/crypto'

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

// Storage keys
const ENCRYPTED_KEY_STORAGE = 'gc_master_key'
const SALT_STORAGE = 'gc_key_salt'

// Singleton state
const user = ref<User | null>(null)
const token = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const initialized = ref(false)
const cryptoInitialized = ref(false)
const cryptoRestoring = ref(false)

export function useAuth() {
  // Initialize from localStorage (sync part)
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
      
      // Check if crypto key exists in localStorage (persistent)
      const storedKey = localStorage.getItem(ENCRYPTED_KEY_STORAGE)
      if (storedKey && token.value) {
        // Start restoring crypto from storage
        cryptoRestoring.value = true
        restoreCryptoFromStorage(storedKey).finally(() => {
          cryptoRestoring.value = false
        })
      }
    }
    
    initialized.value = true
  }

  // Restore crypto key from localStorage
  async function restoreCryptoFromStorage(storedKey: string): Promise<boolean> {
    try {
      console.log('[Auth] Restoring crypto from storage...')
      const keyData = base64ToArrayBuffer(storedKey)
      const masterKey = await importKey(keyData)
      
      // Restore salt too
      const storedSalt = localStorage.getItem(SALT_STORAGE)
      if (storedSalt) {
        const salt = new Uint8Array(base64ToArrayBuffer(storedSalt))
        // @ts-ignore - accessing private property for restoration
        cryptoManager['salt'] = salt
      }
      
      // @ts-ignore - accessing private property for restoration
      cryptoManager['masterKey'] = masterKey
      // @ts-ignore
      cryptoManager['initialized'] = true
      cryptoInitialized.value = true
      console.log('[Auth] Crypto restored from storage successfully')
      return true
    } catch (e) {
      console.error('[Auth] Failed to restore crypto from storage:', e)
      localStorage.removeItem(ENCRYPTED_KEY_STORAGE)
      cryptoInitialized.value = false
      return false
    }
  }

  // Initialize crypto and store key persistently
  async function initializeCrypto(password: string) {
    try {
      console.log('[Auth] Initializing crypto...')
      await cryptoManager.initialize(password)
      
      // Export and store key in localStorage for persistence across refreshes
      const masterKey = cryptoManager.getMasterKey()
      const keyData = await exportKey(masterKey)
      localStorage.setItem(ENCRYPTED_KEY_STORAGE, arrayBufferToBase64(keyData))
      
      cryptoInitialized.value = true
      console.log('[Auth] Crypto initialized and stored')
    } catch (e) {
      console.error('[Auth] Failed to initialize crypto:', e)
      throw e
    }
  }

  // Wait for crypto to be ready (for use in components)
  async function waitForCrypto(timeout = 3000): Promise<boolean> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (cryptoManager.isInitialized()) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    return cryptoManager.isInitialized()
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
      
      const { token: newToken, user: userData } = res.data
      
      // Store in state and localStorage
      token.value = newToken
      user.value = {
        id: userData?.id || 0,
        username: userData?.username || trimmedUsername,
        email: userData?.email || undefined,
        created_at: userData?.created_at || '',
      }
      
      localStorage.setItem('gc_token', newToken)
      localStorage.setItem('gc_user', user.value.username)
      if (user.value.email) {
        localStorage.setItem('gc_email', user.value.email)
      }

      // Initialize encryption with password
      await initializeCrypto(password)

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
    cryptoInitialized.value = false
    
    // Clear auth storage
    localStorage.removeItem('gc_token')
    localStorage.removeItem('gc_user')
    localStorage.removeItem('gc_email')
    
    // Clear crypto (but keep salt for re-login)
    cryptoManager.clear()
    localStorage.removeItem(ENCRYPTED_KEY_STORAGE)
    
    console.log('[Auth] Logged out and cleared crypto')
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
      
      // Re-initialize crypto with new password
      // Note: This will change the encryption key - existing files won't be readable
      // In a production system, you'd need to re-encrypt all files
      await initializeCrypto(newPassword)
      
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

  // Check if crypto is ready
  function isCryptoReady(): boolean {
    return cryptoManager.isInitialized()
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
    user: user.value,
    cryptoReady: cryptoManager.isInitialized()
  }))

  return {
    // State (readonly)
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    error: readonly(error),
    cryptoInitialized: readonly(cryptoInitialized),
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
    isCryptoReady,
    waitForCrypto,
    clearError,
  }
}
