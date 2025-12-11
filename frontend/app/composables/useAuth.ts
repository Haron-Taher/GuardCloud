// Authentication composable for GuardCloud
// Handles user login, signup, logout, and session management

import { ref, readonly, computed } from 'vue'
import apiClient from '~/utils/apiClient'
import { cryptoManager, arrayBufferToBase64, base64ToArrayBuffer, exportKey, importKey } from '~/utils/crypto'

// User data structure
export interface User {
  id: number
  username: string
  email?: string
  created_at: string
  storage_used?: number
  file_count?: number
}

// Activity log entry structure
export interface Activity {
  id: number
  action: string
  target_type?: string
  target_id?: number
  target_name?: string
  details?: string
  created_at: string
}

// Keys for storing crypto data in localStorage
const ENCRYPTED_KEY_STORAGE = 'gc_master_key'
const SALT_STORAGE = 'gc_key_salt'

// Global state shared across all components
const user = ref<User | null>(null)
const token = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const initialized = ref(false)
const cryptoInitialized = ref(false)
const cryptoRestoring = ref(false)

export function useAuth() {
  // Load saved session from localStorage on startup
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
      
      // Try to restore encryption key if user was logged in
      const storedKey = localStorage.getItem(ENCRYPTED_KEY_STORAGE)
      if (storedKey && token.value) {
        cryptoRestoring.value = true
        restoreCryptoFromStorage(storedKey).finally(() => {
          cryptoRestoring.value = false
        })
      }
    }
    
    initialized.value = true
  }

  // Restore the encryption key from localStorage after page refresh
  async function restoreCryptoFromStorage(storedKey: string): Promise<boolean> {
    try {
      const keyData = base64ToArrayBuffer(storedKey)
      const masterKey = await importKey(keyData)
      
      // Restore the salt too
      const storedSalt = localStorage.getItem(SALT_STORAGE)
      if (storedSalt) {
        const salt = new Uint8Array(base64ToArrayBuffer(storedSalt))
        // @ts-ignore - need to access private property
        cryptoManager['salt'] = salt
      }
      
      // @ts-ignore - restoring internal state
      cryptoManager['masterKey'] = masterKey
      // @ts-ignore
      cryptoManager['initialized'] = true
      cryptoInitialized.value = true
      return true
    } catch (e) {
      localStorage.removeItem(ENCRYPTED_KEY_STORAGE)
      cryptoInitialized.value = false
      return false
    }
  }

  // Set up encryption using the user's password
  async function initializeCrypto(password: string) {
    try {
      await cryptoManager.initialize(password)
      
      // Save the key so encryption works after page refresh
      const masterKey = cryptoManager.getMasterKey()
      const keyData = await exportKey(masterKey)
      localStorage.setItem(ENCRYPTED_KEY_STORAGE, arrayBufferToBase64(keyData))
      
      cryptoInitialized.value = true
    } catch (e) {
      throw e
    }
  }

  // Wait for encryption to be ready before doing file operations
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

  /**
   * This meets Functional Requirement #2:
   * FR-2: The user SHALL be prompted for a login or create account option.
   * 
   * Logs in a user with username and password
   */
  async function login(username: string, password: string) {
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
      
      // Save session data
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

      // Set up encryption with the user's password
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

  /**
   * This meets Functional Requirement #2:
   * FR-2: The user SHALL be prompted for a login or create account option.
   * 
   * Creates a new user account
   */
  async function signup(username: string, email: string, password: string) {
    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()
    
    // Validate inputs
    if (!trimmedUsername || trimmedUsername.length < 3) {
      throw new Error('Username must be at least 3 characters')
    }
    
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

  /**
   * This meets Functional Requirement #20:
   * FR-20: The user SHALL be able to log out and end an authenticated session.
   * 
   * Logs out the user and clears all session data
   */
  function logout() {
    token.value = null
    user.value = null
    cryptoInitialized.value = false
    
    // Clear saved session
    localStorage.removeItem('gc_token')
    localStorage.removeItem('gc_user')
    localStorage.removeItem('gc_email')
    
    // Clear encryption keys
    cryptoManager.clear()
    localStorage.removeItem(ENCRYPTED_KEY_STORAGE)
  }

  // Check if the saved token is still valid
  async function validateSession(): Promise<boolean> {
    if (!token.value) return false

    try {
      const res = await apiClient.get('/auth/me')
      user.value = res.data
      return true
    } catch {
      logout()
      return false
    }
  }

  // Get the current user's profile from the server
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

  // Update the user's email address
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

  // Change the user's password
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
      
      // Update encryption with new password
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

  // Get the user's activity history
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

  // Quick check if user is logged in
  function isLoggedIn(): boolean {
    return !!token.value
  }

  // Quick check if encryption is ready
  function isCryptoReady(): boolean {
    return cryptoManager.isInitialized()
  }

  // Clear any error messages
  function clearError() {
    error.value = null
  }

  // Run init on first use
  init()

  // Computed state for easy access in components
  const authState = computed(() => ({
    isAuthenticated: !!token.value,
    username: user.value?.username || null,
    email: user.value?.email || null,
    user: user.value,
    cryptoReady: cryptoManager.isInitialized()
  }))

  return {
    // State (read-only to prevent accidental changes)
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
