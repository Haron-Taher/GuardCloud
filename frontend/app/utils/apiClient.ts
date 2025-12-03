import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 30000, // 30 second timeout
})

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  if (process.client) {
    const token = localStorage.getItem('gc_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (process.client) {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response?.status === 401) {
        localStorage.removeItem('gc_token')
        localStorage.removeItem('gc_user')
        
        // Only redirect if not already on auth pages
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/signup')) {
          window.location.href = '/login?expired=true'
        }
      }
      
      // Handle network errors
      if (!error.response) {
        console.error('Network error:', error.message)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
