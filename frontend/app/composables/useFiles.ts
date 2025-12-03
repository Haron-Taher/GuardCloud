import { ref, shallowRef } from 'vue'
import apiClient from '~/utils/apiClient'

interface FileItem {
  id: number
  filename: string
  size: number
  mime_type?: string
  folder_id?: number
  is_trashed?: boolean
  created_at: string
  updated_at?: string
  trashed_at?: string
}

interface FolderItem {
  id: number
  name: string
  parent_id?: number
  created_at: string
}

interface PathItem {
  id: number
  name: string
}

interface ShareLink {
  id: number
  token: string
  has_password: boolean
  expires_at?: string
  max_downloads?: number
  download_count: number
  created_at: string
}

interface ActivityItem {
  id: number
  action: string
  target_type?: string
  target_id?: number
  target_name?: string
  details?: string
  created_at: string
}

interface StorageStats {
  used: number
  limit: number
  available: number
  file_count: number
  percentage: number
}

// Singleton state
const files = shallowRef<FileItem[]>([])
const folders = shallowRef<FolderItem[]>([])
const path = shallowRef<PathItem[]>([])
const currentFolderId = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const uploadProgress = ref(0)
const storageStats = ref<StorageStats | null>(null)

// Cache
const CACHE_DURATION = 30000
let lastFetch = 0
let lastFolderKey = ''

export function useFiles() {
  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

  // Fetch files and folders for current directory
  async function fetchFiles(folderId: number | null = null, force = false) {
    const folderKey = String(folderId)
    const now = Date.now()
    
    if (!force && folderKey === lastFolderKey && now - lastFetch < CACHE_DURATION) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const params = folderId ? { folder_id: folderId } : {}
      const res = await apiClient.get('/files', { params })
      
      files.value = res.data.files || []
      folders.value = res.data.folders || []
      path.value = res.data.path || []
      currentFolderId.value = folderId
      
      lastFetch = now
      lastFolderKey = folderKey
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load files'
      console.error('Fetch files error:', err)
    } finally {
      loading.value = false
    }
  }

  // Search files
  async function searchFiles(query: string): Promise<FileItem[]> {
    if (!query.trim()) return []
    
    try {
      const res = await apiClient.get('/files/search', { params: { q: query } })
      return res.data.files || []
    } catch (err: any) {
      console.error('Search error:', err)
      return []
    }
  }

  // Fetch trashed files
  async function fetchTrash(): Promise<FileItem[]> {
    try {
      const res = await apiClient.get('/files/trash')
      return res.data.files || []
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load trash'
      return []
    }
  }

  // Upload file
  async function upload(file: File, folderId: number | null = null, onProgress?: (percent: number) => void) {
    if (!file) {
      error.value = 'No file selected'
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      error.value = `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      return false
    }

    if (file.size === 0) {
      error.value = 'Cannot upload empty file'
      return false
    }

    loading.value = true
    error.value = null
    uploadProgress.value = 0

    try {
      const formData = new FormData()
      formData.append('file', file)

      const params = folderId ? { folder_id: folderId } : {}
      
      await apiClient.post('/files/upload', formData, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded / e.total) * 100)
            uploadProgress.value = percent
            onProgress?.(percent)
          }
        }
      })

      // Refresh file list
      await fetchFiles(currentFolderId.value, true)
      // Refresh storage stats
      await fetchStorageStats()
      
      return true
    } catch (err: any) {
      if (err.response?.status === 413) {
        error.value = 'Storage limit exceeded'
      } else {
        error.value = err.response?.data?.detail || 'Upload failed'
      }
      return false
    } finally {
      loading.value = false
      uploadProgress.value = 0
    }
  }

  // Download file
  async function download(file: FileItem) {
    try {
      const res = await apiClient.get(`/files/${file.id}/download`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = file.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Download failed'
    }
  }

  // Preview file (for images, text, etc.)
  async function preview(file: FileItem): Promise<{ url?: string; content?: string; mime_type?: string } | null> {
    try {
      const mime = file.mime_type || ''
      
      // For images and PDFs, get blob URL
      if (mime.startsWith('image/') || mime === 'application/pdf') {
        const res = await apiClient.get(`/files/${file.id}/preview`, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([res.data], { type: mime }))
        return { url, mime_type: mime }
      }
      
      // For text files, get content
      if (mime.startsWith('text/') || ['application/json', 'application/javascript'].includes(mime)) {
        const res = await apiClient.get(`/files/${file.id}/preview`)
        return { content: res.data.content, mime_type: res.data.mime_type }
      }
      
      return null
    } catch (err: any) {
      console.error('Preview error:', err)
      return null
    }
  }

  // Rename file
  async function renameFile(file: FileItem, newName: string) {
    if (!newName.trim()) {
      error.value = 'Name cannot be empty'
      return false
    }

    try {
      await apiClient.put(`/files/${file.id}/rename`, { name: newName })
      
      // Update local state
      const index = files.value.findIndex(f => f.id === file.id)
      if (index !== -1) {
        const updated = [...files.value]
        updated[index] = { ...updated[index], filename: newName }
        files.value = updated
      }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Rename failed'
      return false
    }
  }

  // Move file to folder
  async function moveFile(file: FileItem, folderId: number | null) {
    try {
      await apiClient.put(`/files/${file.id}/move`, { folder_id: folderId })
      await fetchFiles(currentFolderId.value, true)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Move failed'
      return false
    }
  }

  // Move file to trash
  async function trashFile(file: FileItem) {
    try {
      await apiClient.post(`/files/${file.id}/trash`)
      
      // Remove from local state
      files.value = files.value.filter(f => f.id !== file.id)
      await fetchStorageStats()
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Could not move to trash'
      return false
    }
  }

  // Restore file from trash
  async function restoreFile(file: FileItem) {
    try {
      await apiClient.post(`/files/${file.id}/restore`)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Restore failed'
      return false
    }
  }

  // Permanently delete file
  async function deleteFile(file: FileItem) {
    try {
      await apiClient.delete(`/files/${file.id}`)
      await fetchStorageStats()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Delete failed'
      return false
    }
  }

  // Create folder
  async function createFolder(name: string, parentId: number | null = null) {
    if (!name.trim()) {
      error.value = 'Folder name cannot be empty'
      return null
    }

    try {
      const res = await apiClient.post('/folders', { name, parent_id: parentId })
      await fetchFiles(currentFolderId.value, true)
      return res.data.folder_id
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Could not create folder'
      return null
    }
  }

  // Rename folder
  async function renameFolder(folder: FolderItem, newName: string) {
    if (!newName.trim()) {
      error.value = 'Name cannot be empty'
      return false
    }

    try {
      await apiClient.put(`/folders/${folder.id}/rename`, { name: newName })
      
      // Update local state
      const index = folders.value.findIndex(f => f.id === folder.id)
      if (index !== -1) {
        const updated = [...folders.value]
        updated[index] = { ...updated[index], name: newName }
        folders.value = updated
      }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Rename failed'
      return false
    }
  }

  // Delete folder
  async function deleteFolder(folder: FolderItem) {
    try {
      await apiClient.delete(`/folders/${folder.id}`)
      folders.value = folders.value.filter(f => f.id !== folder.id)
      await fetchStorageStats()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Delete failed'
      return false
    }
  }

  // Create share link
  async function createShareLink(fileId: number, options: {
    password?: string
    expires_in_days?: number
    max_downloads?: number
  } = {}) {
    try {
      const res = await apiClient.post(`/files/${fileId}/share`, options)
      return res.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Could not create share link'
      return null
    }
  }

  // Get share links for a file
  async function getShareLinks(fileId: number): Promise<ShareLink[]> {
    try {
      const res = await apiClient.get(`/files/${fileId}/shares`)
      return res.data.shares || []
    } catch (err: any) {
      console.error('Get shares error:', err)
      return []
    }
  }

  // Delete share link
  async function deleteShareLink(linkId: number) {
    try {
      await apiClient.delete(`/shares/${linkId}`)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Could not delete share link'
      return false
    }
  }

  // Get activity log
  async function getActivity(limit = 50): Promise<ActivityItem[]> {
    try {
      const res = await apiClient.get('/activity', { params: { limit } })
      return res.data.activities || []
    } catch (err: any) {
      console.error('Get activity error:', err)
      return []
    }
  }

  // Get storage stats
  async function fetchStorageStats() {
    try {
      const res = await apiClient.get('/storage')
      storageStats.value = res.data
      return res.data
    } catch (err: any) {
      console.error('Get storage stats error:', err)
      return null
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCache() {
    lastFetch = 0
    lastFolderKey = ''
  }

  return {
    // State
    files,
    folders,
    path,
    currentFolderId,
    loading,
    error,
    uploadProgress,
    storageStats,
    
    // File operations
    fetchFiles,
    searchFiles,
    fetchTrash,
    upload,
    download,
    preview,
    renameFile,
    moveFile,
    trashFile,
    restoreFile,
    deleteFile,
    
    // Folder operations
    createFolder,
    renameFolder,
    deleteFolder,
    
    // Share operations
    createShareLink,
    getShareLinks,
    deleteShareLink,
    
    // Other
    getActivity,
    fetchStorageStats,
    clearError,
    clearCache,
  }
}
