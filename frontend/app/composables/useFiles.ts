// File management composable for GuardCloud
// Handles file upload, download, encryption, sharing, and folder operations

import { ref, shallowRef } from 'vue'
import apiClient from '~/utils/apiClient'
import { cryptoManager, type EncryptionMetadata, arrayBufferToBase64, base64ToArrayBuffer } from '~/utils/crypto'

// Data structures
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

// Global state shared across components
const files = shallowRef<FileItem[]>([])
const folders = shallowRef<FolderItem[]>([])
const path = shallowRef<PathItem[]>([])
const currentFolderId = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const uploadProgress = ref(0)
const isUploading = ref(false)
const storageStats = ref<StorageStats | null>(null)

// Simple cache to avoid refetching too often
const CACHE_DURATION = 30000
let lastFetch = 0
let lastFolderKey = ''

/**
 * Pack encrypted data with its metadata for storage
 * Format: [4 bytes length][metadata JSON][encrypted data]
 */
function packEncryptedData(encryptedData: ArrayBuffer, metadata: EncryptionMetadata): ArrayBuffer {
  const metadataJson = JSON.stringify(metadata)
  const metadataBytes = new TextEncoder().encode(metadataJson)
  
  // Header stores metadata length
  const header = new ArrayBuffer(4)
  new DataView(header).setUint32(0, metadataBytes.length, true)
  
  // Combine everything into one buffer
  const result = new Uint8Array(4 + metadataBytes.length + encryptedData.byteLength)
  result.set(new Uint8Array(header), 0)
  result.set(metadataBytes, 4)
  result.set(new Uint8Array(encryptedData), 4 + metadataBytes.length)
  
  return result.buffer
}

/**
 * Unpack encrypted data and extract metadata
 */
function unpackEncryptedData(data: ArrayBuffer): { encryptedData: ArrayBuffer; metadata: EncryptionMetadata } {
  const view = new DataView(data)
  const metadataLength = view.getUint32(0, true)
  
  // Get metadata
  const metadataBytes = new Uint8Array(data, 4, metadataLength)
  const metadataJson = new TextDecoder().decode(metadataBytes)
  const metadata = JSON.parse(metadataJson) as EncryptionMetadata
  
  // Get encrypted data
  const encryptedData = data.slice(4 + metadataLength)
  
  return { encryptedData, metadata }
}

/**
 * Check if data has our encryption format
 */
function isEncryptedData(data: ArrayBuffer): boolean {
  if (data.byteLength < 10) return false
  
  try {
    const view = new DataView(data)
    const metadataLength = view.getUint32(0, true)
    
    // Metadata shouldn't be too big or too small
    if (metadataLength > 1024 || metadataLength < 10) return false
    
    // Try parsing it
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
  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB limit

  // Check if encryption is ready to use
  function isEncryptionReady(): boolean {
    return cryptoManager.isInitialized()
  }

  /**
   * This meets Functional Requirement #3:
   * FR-3: The user SHALL be presented with a file management system after successfully logging in.
   * 
   * Loads files and folders for the current directory
   */
  async function fetchFiles(folderId: number | null = null, force = false) {
    const folderKey = String(folderId)
    const now = Date.now()
    
    // Use cached data if recent
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
    } finally {
      loading.value = false
    }
  }

  /**
   * This meets Functional Requirement #10:
   * FR-10: The user SHALL be able find files using a search function.
   * 
   * Searches files by name
   */
  async function searchFiles(query: string): Promise<FileItem[]> {
    if (!query.trim()) return []
    
    try {
      const res = await apiClient.get('/files/search', { params: { q: query } })
      return res.data.files || []
    } catch (err: any) {
      return []
    }
  }

  // Load files in trash
  async function fetchTrash(): Promise<FileItem[]> {
    try {
      const res = await apiClient.get('/files/trash')
      return res.data.files || []
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load trash'
      return []
    }
  }

  /**
   * This meets Functional Requirements #4 and #6:
   * FR-4: The user SHALL be able to upload files in the file management system.
   * FR-6: The user SHALL be able to encrypt the files or contents that are being shared in transit.
   * 
   * Uploads a file with client-side encryption
   */
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

    if (!isEncryptionReady()) {
      error.value = 'Encryption not initialized. Please log in again.'
      return false
    }

    loading.value = true
    isUploading.value = true
    error.value = null
    uploadProgress.value = 5

    try {
      // Read the file
      const fileData = await file.arrayBuffer()
      uploadProgress.value = 10
      
      // Encrypt it
      const { encryptedData, metadata } = await cryptoManager.encryptFile(fileData)
      uploadProgress.value = 30
      
      // Pack with metadata
      const packedData = packEncryptedData(encryptedData, metadata)
      
      // Create blob for upload
      const encryptedBlob = new Blob([packedData], { type: 'application/octet-stream' })
      
      // Build form data
      const formData = new FormData()
      formData.append('file', encryptedBlob, file.name)
      formData.append('original_mime_type', file.type || 'application/octet-stream')
      formData.append('encrypted', 'true')

      const params = folderId ? { folder_id: folderId } : {}
      
      uploadProgress.value = 40

      // Upload to server
      await apiClient.post('/files/upload', formData, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = 40 + Math.round((e.loaded / e.total) * 60)
            uploadProgress.value = Math.min(percent, 99)
            onProgress?.(uploadProgress.value)
          }
        }
      })

      uploadProgress.value = 100
      
      // Refresh the file list
      await fetchFiles(currentFolderId.value, true)
      await fetchStorageStats()
      
      return true
    } catch (err: any) {
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
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }

  /**
   * This meets Functional Requirements #7 and #12:
   * FR-7: The user SHALL be able to decrypt the files once they reach the client.
   * FR-12: The user SHALL be able to download files.
   * 
   * Downloads and decrypts a file
   */
  async function download(file: FileItem) {
    if (!isEncryptionReady()) {
      error.value = 'Encryption not initialized. Please log in again.'
      return
    }

    try {
      // Get encrypted file from server
      const res = await apiClient.get(`/files/${file.id}/download`, {
        responseType: 'arraybuffer'
      })

      const packedData = res.data as ArrayBuffer
      
      if (isEncryptedData(packedData)) {
        try {
          // Decrypt the file
          const { encryptedData, metadata } = unpackEncryptedData(packedData)
          const decryptedData = await cryptoManager.decryptFile(encryptedData, metadata)
          
          // Trigger browser download
          const mimeType = file.mime_type || 'application/octet-stream'
          const url = window.URL.createObjectURL(new Blob([decryptedData], { type: mimeType }))
          const link = document.createElement('a')
          link.href = url
          link.download = file.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } catch (decryptError) {
          error.value = 'Failed to decrypt file. The file may be corrupted or encrypted with a different key.'
        }
      } else {
        // Not encrypted, download as-is
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
      error.value = err.response?.data?.detail || 'Download failed'
    }
  }

  // Get decrypted file data (used for sharing)
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
        return {
          data: packedData,
          mimeType: file.mime_type || 'application/octet-stream'
        }
      }
    } catch (err) {
      return null
    }
  }

  /**
   * This meets Functional Requirements #8 and #15:
   * FR-8: The user SHALL be able to view file information via the web app.
   * FR-15: The user SHALL be able to view file details.
   * 
   * Gets file preview data (for images, text, PDFs)
   */
  async function preview(file: FileItem): Promise<{ url?: string; content?: string; mime_type?: string } | null> {
    if (!isEncryptionReady()) {
      error.value = 'Encryption not initialized. Please log in again.'
      return null
    }

    try {
      const mime = file.mime_type || ''
      
      // Get encrypted data
      const res = await apiClient.get(`/files/${file.id}/download`, {
        responseType: 'arraybuffer'
      })
      
      const packedData = res.data as ArrayBuffer
      
      if (isEncryptedData(packedData)) {
        try {
          // Decrypt
          const { encryptedData, metadata } = unpackEncryptedData(packedData)
          const decryptedData = await cryptoManager.decryptFile(encryptedData, metadata)
          
          // Images and PDFs get a blob URL
          if (mime.startsWith('image/') || mime === 'application/pdf') {
            const url = window.URL.createObjectURL(new Blob([decryptedData], { type: mime }))
            return { url, mime_type: mime }
          }
          
          // Text files get decoded content
          if (mime.startsWith('text/') || ['application/json', 'application/javascript'].includes(mime)) {
            const content = new TextDecoder().decode(decryptedData)
            return { content, mime_type: mime }
          }
          
          // Everything else gets a blob URL
          const url = window.URL.createObjectURL(new Blob([decryptedData], { type: mime }))
          return { url, mime_type: mime }
        } catch (decryptError) {
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
      return null
    }
  }

  /**
   * This meets Functional Requirements #9 and #11:
   * FR-9: The user SHALL be able to manage properties of files within the system.
   * FR-11: The user SHALL be able to manage files.
   * 
   * Renames a file
   */
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

  /**
   * This meets Functional Requirement #16:
   * FR-16: The user SHALL be able to view the location of files.
   * 
   * Moves a file to a different folder
   */
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

  /**
   * This meets Functional Requirement #13:
   * FR-13: The user SHALL be able to delete files.
   * 
   * Moves a file to trash
   */
  async function trashFile(file: FileItem) {
    try {
      await apiClient.post(`/files/${file.id}/trash`)
      
      // Remove from local list
      files.value = files.value.filter(f => f.id !== file.id)
      await fetchStorageStats()
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Could not move to trash'
      return false
    }
  }

  // Restore a file from trash
  async function restoreFile(file: FileItem) {
    try {
      await apiClient.post(`/files/${file.id}/restore`)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Restore failed'
      return false
    }
  }

  // Permanently delete a file
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

  // Create a new folder
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

  // Rename a folder
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

  // Delete a folder
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

  /**
   * This meets Functional Requirements #5, #14, and #18:
   * FR-5: The user SHALL be able to share files.
   * FR-14: The user SHALL be able to share files.
   * FR-18: The user SHALL be able to grant file access permissions.
   * 
   * Creates a share link with optional password and expiration
   */
  async function createShareLink(fileId: number, options: {
    password?: string
    expires_in_days?: number
    max_downloads?: number
  } = {}) {
    try {
      const file = files.value.find(f => f.id === fileId)
      if (!file) {
        error.value = 'File not found'
        return null
      }

      const formData = new FormData()
      
      // Upload decrypted version for sharing
      if (isEncryptionReady()) {
        const decrypted = await getDecryptedFileData(file)
        if (decrypted) {
          const blob = new Blob([decrypted.data], { type: decrypted.mimeType })
          formData.append('file', blob, file.filename)
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
      error.value = err.response?.data?.detail || 'Could not create share link'
      return null
    }
  }

  // Get all share links for a file
  async function getShareLinks(fileId: number): Promise<ShareLink[]> {
    try {
      const res = await apiClient.get(`/files/${fileId}/shares`)
      return res.data.shares || []
    } catch (err: any) {
      return []
    }
  }

  /**
   * This meets Functional Requirements #17 and #19:
   * FR-17: The user SHALL be able to delete shared files.
   * FR-19: The user SHALL be able to revoke file access permissions.
   * 
   * Deletes a share link
   */
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
      return []
    }
  }

  // Get storage usage stats
  async function fetchStorageStats() {
    try {
      const res = await apiClient.get('/storage')
      storageStats.value = res.data
      return res.data
    } catch (err: any) {
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
    
    // Encryption check
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
