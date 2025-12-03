import { ref, shallowRef } from 'vue'
import api from '~/utils/apiClient'

export interface FileItem {
  id: number
  filename: string
  size: number
  created_at: string
  updated_at?: string
  mime_type?: string
}

// Singleton state - shared across all components
const files = shallowRef<FileItem[]>([])
const loading = ref(false)
const error = ref('')
const lastFetch = ref<number>(0)

// Cache duration in milliseconds (30 seconds)
const CACHE_DURATION = 30000

export function useFilesState() {
  async function fetchFiles(force = false): Promise<void> {
    // Skip if already loading
    if (loading.value) return
    
    // Use cache if recent fetch and not forced
    const now = Date.now()
    if (!force && lastFetch.value && (now - lastFetch.value) < CACHE_DURATION) {
      return
    }

    error.value = ''
    loading.value = true

    try {
      const res = await api.get('/files')
      
      // Handle different response formats
      const fileData = res.data.files || res.data || []
      
      if (!Array.isArray(fileData)) {
        throw new Error('Invalid response format')
      }
      
      files.value = fileData as FileItem[]
      lastFetch.value = now
    } catch (e: any) {
      const message = e?.response?.data?.detail 
        || e?.response?.data?.message 
        || e?.message 
        || 'Failed to load files'
      error.value = message
      console.error('Failed to fetch files:', e)
    } finally {
      loading.value = false
    }
  }

  async function upload(file: File, onProgress?: (percent: number) => void): Promise<boolean> {
    // Validate file
    if (!file) {
      error.value = 'No file provided'
      return false
    }
    
    // Check file size (100MB limit)
    const MAX_SIZE = 100 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      error.value = 'File size exceeds 100MB limit'
      return false
    }
    
    // Check for empty files
    if (file.size === 0) {
      error.value = 'Cannot upload empty file'
      return false
    }

    error.value = ''
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent)
          }
        },
      })
      
      // Refresh file list
      await fetchFiles(true)
      return true
    } catch (e: any) {
      const message = e?.response?.data?.detail 
        || e?.response?.data?.message 
        || e?.message 
        || 'Upload failed'
      error.value = message
      console.error('Upload failed:', e)
      return false
    }
  }

  async function download(file: FileItem): Promise<boolean> {
    if (!process.client) return false
    
    if (!file?.id) {
      error.value = 'Invalid file'
      return false
    }

    error.value = ''

    try {
      const res = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob',
      })

      // Create download link
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename || 'download'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      return true
    } catch (e: any) {
      const message = e?.response?.data?.detail 
        || e?.response?.data?.message 
        || e?.message 
        || 'Download failed'
      error.value = message
      console.error('Download failed:', e)
      return false
    }
  }

  async function deleteFile(file: FileItem): Promise<boolean> {
    if (!file?.id) {
      error.value = 'Invalid file'
      return false
    }

    error.value = ''

    try {
      await api.delete(`/files/${file.id}`)
      
      // Remove from local state immediately
      files.value = files.value.filter(f => f.id !== file.id)
      
      return true
    } catch (e: any) {
      const message = e?.response?.data?.detail 
        || e?.response?.data?.message 
        || e?.message 
        || 'Delete failed'
      error.value = message
      console.error('Delete failed:', e)
      return false
    }
  }

  async function renameFile(file: FileItem, newName: string): Promise<boolean> {
    if (!file?.id) {
      error.value = 'Invalid file'
      return false
    }
    
    if (!newName?.trim()) {
      error.value = 'File name is required'
      return false
    }

    error.value = ''

    try {
      await api.patch(`/files/${file.id}`, {
        filename: newName.trim(),
      })
      
      // Update local state
      const idx = files.value.findIndex(f => f.id === file.id)
      if (idx !== -1) {
        files.value = [
          ...files.value.slice(0, idx),
          { ...files.value[idx], filename: newName.trim() },
          ...files.value.slice(idx + 1),
        ]
      }
      
      return true
    } catch (e: any) {
      const message = e?.response?.data?.detail 
        || e?.response?.data?.message 
        || e?.message 
        || 'Rename failed'
      error.value = message
      console.error('Rename failed:', e)
      return false
    }
  }

  function clearError(): void {
    error.value = ''
  }

  function clearCache(): void {
    lastFetch.value = 0
  }

  return {
    files,
    loading,
    error,
    fetchFiles,
    upload,
    download,
    deleteFile,
    renameFile,
    clearError,
    clearCache,
  }
}
