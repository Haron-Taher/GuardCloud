import { ref, shallowRef } from 'vue'
import apiClient from '~/utils/apiClient'
import { cryptoManager, type EncryptionMetadata, arrayBufferToBase64, base64ToArrayBuffer } from '~/utils/crypto'

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
const isUploading = ref(false)
const storageStats = ref<StorageStats | null>(null)

// Cache
const CACHE_DURATION = 30000
let lastFetch = 0
let lastFolderKey = ''

/**
 * Pack encrypted data with metadata for storage
 * Format: [4 bytes: metadata length][metadata JSON][encrypted data]
 */
function packEncryptedData(encryptedData: ArrayBuffer, metadata: EncryptionMetadata): ArrayBuffer {
  const metadataJson = JSON.stringify(metadata)
  const metadataBytes = new TextEncoder().encode(metadataJson)
  
  // Create header with metadata length
  const header = new ArrayBuffer(4)
  new DataView(header).setUint32(0, metadataBytes.length, true) // little-endian
  
  // Combine: header + metadata + encrypted data
  const result = new Uint8Array(4 + metadataBytes.length + encryptedData.byteLength)
  result.set(new Uint8Array(header), 0)
  result.set(metadataBytes, 4)
  result.set(new Uint8Array(encryptedData), 4 + metadataBytes.length)
  
  return result.buffer
}

/**
 * Unpack encrypted data and metadata from storage
 */
function unpackEncryptedData(data: ArrayBuffer): { encryptedData: ArrayBuffer; metadata: EncryptionMetadata } {
  const view = new DataView(data)
  const metadataLength = view.getUint32(0, true) // little-endian
  
  // Extract metadata
  const metadataBytes = new Uint8Array(data, 4, metadataLength)
  const metadataJson = new TextDecoder().decode(metadataBytes)
  const metadata = JSON.parse(metadataJson) as EncryptionMetadata
  
  // Extract encrypted data
  const encryptedData = data.slice(4 + metadataLength)
  
  return { encryptedData, metadata }
}

/**
 * Check if data is encrypted (has our header format)
 */
function isEncryptedData(data: ArrayBuffer): boolean {
  if (data.byteLength < 10) return false
  
  try {
    const view = new DataView(data)
    const metadataLength = view.getUint32(0, true)
    
    // Sanity check: metadata shouldn't be larger than 1KB
    if (metadataLength > 1024 || metadataLength < 10) return false
    
    // Try to parse metadata
    const metadataBytes = new Uint8Array(data, 4, metadataLength)
    const metadataJson = new TextDecoder().decode(metadataBytes)
    const metadata = JSON.parse(metadataJson)
    
    // Check for required fields
    return metadata.iv && metadata.keyIv && metadata.wrappedKey && metadata.version
  } catch {
    return false
  }
}

export function useFiles() {
  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

  // Check if encryption is available
  function isEncryptionReady(): boolean {
    return cryptoManager.isInitialized()
  }

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

  // Upload file with encryption
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

    // Check if encryption is ready
    if (!isEncryptionReady()) {
      error.value = 'Encryption not initialized. Please log in again.'
      return false
    }

    loading.value = true
    isUploading.value = true
    error.value = null
    uploadProgress.value = 5 // Start at 5% to show activity

    try {
      // Read file as ArrayBuffer
      const fileData = await file.arrayBuffer()
      uploadProgress.value = 10
      
      // Encrypt the file
      console.log('[Upload] Encrypting file:', file.name)
      const { encryptedData, metadata } = await cryptoManager.encryptFile(fileData)
      uploadProgress.value = 30
      console.log('[Upload] File encrypted, metadata:', metadata)
      
      // Pack encrypted data with metadata
      const packedData = packEncryptedData(encryptedData, metadata)
      console.log('[Upload] Original size:', fileData.byteLength, 'Encrypted size:', packedData.byteLength)
      
      // Create encrypted blob
      const encryptedBlob = new Blob([packedData], { type: 'application/octet-stream' })
      
      // Create form data with encrypted file
      const formData = new FormData()
      formData.append('file', encryptedBlob, file.name)
      
      // Also send original mime type for later decryption
      formData.append('original_mime_type', file.type || 'application/octet-stream')
      formData.append('encrypted', 'true')

      const params = folderId ? { folder_id: folderId } : {}
      
      uploadProgress.value = 40

      await apiClient.post('/files/upload', formData, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            // Map 40-100% to upload progress
            const percent = 40 + Math.round((e.loaded / e.total) * 60)
            uploadProgress.value = Math.min(percent, 99)
            onProgress?.(uploadProgress.value)
          }
        }
      })

      uploadProgress.value = 100
      console.log('[Upload] Upload complete')
      
      // Refresh file list
      await fetchFiles(currentFolderId.value, true)
      // Refresh storage stats
      await fetchStorageStats()
      
      return true
    } catch (err: any) {
      console.error('[Upload] Error:', err)
      if (err.response?.status === 413) {
        error.value = 'Storage limit exceeded'
      } else if (err.name === 'OperationError') {
        error.value = 'Encryption failed. Please try again.'
      } else {
        error.value = err.response?.data?.detail || 'Upload failed'
      }
      return false
    } finally {
      loading.value = false
      isUploading.value = false
      // Reset progress after a delay
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }

  // Download file with decryption
  async function download(file: FileItem) {
    // Check if encryption is ready
    if (!isEncryptionReady()) {
      error.value = 'Encryption not initialized. Please log in again.'
      return
    }

    try {
      console.log('[Download] Downloading file:', file.filename)
      
      const res = await apiClient.get(`/files/${file.id}/download`, {
        responseType: 'arraybuffer'
      })

      // Unpack and decrypt
      const packedData = res.data as ArrayBuffer
      console.log('[Download] Received data, size:', packedData.byteLength)
      
      // Check if data is encrypted
      if (isEncryptedData(packedData)) {
        try {
          const { encryptedData, metadata } = unpackEncryptedData(packedData)
          console.log('[Download] Decrypting with metadata:', metadata)
          
          const decryptedData = await cryptoManager.decryptFile(encryptedData, metadata)
          console.log('[Download] Decrypted size:', decryptedData.byteLength)
          
          // Create download with decrypted data
          const mimeType = file.mime_type || 'application/octet-stream'
          const url = window.URL.createObjectURL(new Blob([decryptedData], { type: mimeType }))
          const link = document.createElement('a')
          link.href = url
          link.download = file.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          console.log('[Download] Download complete')
        } catch (decryptError) {
          console.error('[Download] Decryption failed:', decryptError)
          error.value = 'Failed to decrypt file. The file may be corrupted or encrypted with a different key.'
        }
      } else {
        // File is not encrypted (legacy), download as-is
        console.log('[Download] File is not encrypted, downloading as-is')
        const url = window.URL.createObjectURL(new Blob([packedData]))
        const link = document.createElement('a')
        link.href = url
        link.download = file.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (err: any) {
      console.error('[Download] Error:', err)
      error.value = err.response?.data?.detail || 'Download failed'
    }
  }

  // Get decrypted file data (for sharing)
  async function getDecryptedFileData(file: FileItem): Promise<{ data: ArrayBuffer; mimeType: string } | null> {
    if (!isEncryptionReady()) {
      return null
    }

    try {
      const res = await apiClient.get(`/files/${file.id}/download`, {
        responseType: 'arraybuffer'
      })

      const packedData = res.data as ArrayBuffer
      
      if (isEncryptedData(packedData)) {
        const { encryptedData, metadata } = unpackEncryptedData(packedData)
        const decryptedData = await cryptoManager.decryptFile(encryptedData, metadata)
        return {
          data: decryptedData,
          mimeType: file.mime_type || 'application/octet-stream'
        }
      } else {
        // Not encrypted
        return {
          data: packedData,
          mimeType: file.mime_type || 'application/octet-stream'
        }
      }
    } catch (err) {
      console.error('[getDecryptedFileData] Error:', err)
      return null
    }
  }

  // Preview file (for images, text, etc.) with decryption
  async function preview(file: FileItem): Promise<{ url?: string; content?: string; mime_type?: string } | null> {
    // Check if encryption is ready
    if (!isEncryptionReady()) {
      error.value = 'Encryption not initialized. Please log in again.'
      return null
    }

    try {
      const mime = file.mime_type || ''
      
      console.log('[Preview] Loading preview for:', file.filename, 'MIME:', mime)
      
      // Get encrypted data
      const res = await apiClient.get(`/files/${file.id}/download`, {
        responseType: 'arraybuffer'
      })
      
      const packedData = res.data as ArrayBuffer
      
      // Check if data is encrypted
      if (isEncryptedData(packedData)) {
        try {
          // Decrypt the file
          const { encryptedData, metadata } = unpackEncryptedData(packedData)
          const decryptedData = await cryptoManager.decryptFile(encryptedData, metadata)
          
          // For images and PDFs, create blob URL
          if (mime.startsWith('image/') || mime === 'application/pdf') {
            const url = window.URL.createObjectURL(new Blob([decryptedData], { type: mime }))
            return { url, mime_type: mime }
          }
          
          // For text files, decode content
          if (mime.startsWith('text/') || ['application/json', 'application/javascript'].includes(mime)) {
            const content = new TextDecoder().decode(decryptedData)
            return { content, mime_type: mime }
          }
          
          // For other types, create generic blob URL
          const url = window.URL.createObjectURL(new Blob([decryptedData], { type: mime }))
          return { url, mime_type: mime }
        } catch (decryptError) {
          console.error('[Preview] Decryption failed:', decryptError)
          return null
        }
      } else {
        // Not encrypted
        if (mime.startsWith('image/') || mime === 'application/pdf') {
          const url = window.URL.createObjectURL(new Blob([packedData], { type: mime }))
          return { url, mime_type: mime }
        }
        
        if (mime.startsWith('text/') || ['application/json', 'application/javascript'].includes(mime)) {
          const content = new TextDecoder().decode(packedData)
          return { content, mime_type: mime }
        }
        
        return null
      }
    } catch (err: any) {
      console.error('[Preview] Error:', err)
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

  // Create share link - uploads decrypted version for sharing
  async function createShareLink(fileId: number, options: {
    password?: string
    expires_in_days?: number
    max_downloads?: number
  } = {}) {
    try {
      // Get the file info
      const file = files.value.find(f => f.id === fileId)
      if (!file) {
        error.value = 'File not found'
        return null
      }

      // Create form data
      const formData = new FormData()
      
      // If encryption is ready, get decrypted file data for sharing
      if (isEncryptionReady()) {
        const decrypted = await getDecryptedFileData(file)
        if (decrypted) {
          const blob = new Blob([decrypted.data], { type: decrypted.mimeType })
          formData.append('file', blob, file.filename)
          console.log('[Share] Uploading decrypted file for sharing')
        }
      }
      
      if (options.password) formData.append('password', options.password)
      if (options.expires_in_days) formData.append('expires_in_days', String(options.expires_in_days))
      if (options.max_downloads) formData.append('max_downloads', String(options.max_downloads))

      const res = await apiClient.post(`/files/${fileId}/share`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      return res.data
    } catch (err: any) {
      console.error('[Share] Error:', err)
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
    isUploading,
    storageStats,
    
    // Encryption status
    isEncryptionReady,
    
    // File operations
    fetchFiles,
    searchFiles,
    fetchTrash,
    upload,
    download,
    getDecryptedFileData,
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
