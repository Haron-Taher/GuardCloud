<!--
  Share Download Page
  
  This meets Functional Requirements #5, #12, and #14:
  FR-5: The user SHALL be able to share files.
  FR-12: The user SHALL be able to download files.
  FR-14: The user SHALL be able to share files.
  
  This page allows recipients to download shared files via a secure link.
-->

<template>
  <div class="share-page">
    <div class="share-container">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <img src="~/assets/logos/securecloud.png" alt="GuardCloud" class="logo-img" />
        <span class="logo-text">GuardCloud</span>
      </NuxtLink>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <h2>{{ errorTitle }}</h2>
        <p>{{ error }}</p>
        <NuxtLink to="/" class="btn btn-primary">Go to homepage</NuxtLink>
      </div>

      <!-- File Info -->
      <div v-else class="file-card">
        <div class="file-icon-wrap" :class="fileIconClass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path :d="fileIconPath" />
          </svg>
        </div>
        <h2 class="file-name">{{ fileInfo?.filename }}</h2>
        <p class="file-size">{{ formatSize(fileInfo?.size || 0) }}</p>

        <!-- Password Input -->
        <div v-if="fileInfo?.has_password && !passwordVerified" class="password-section">
          <div class="password-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            This file is password protected
          </div>
          <input 
            v-model="password"
            type="password"
            placeholder="Enter password"
            class="password-input"
            @keyup.enter="downloadFile"
          />
          <p v-if="passwordError" class="password-error">{{ passwordError }}</p>
        </div>

        <!-- Download Button -->
        <button 
          class="btn btn-primary btn-large"
          @click="downloadFile"
          :disabled="downloading || (fileInfo?.has_password && !password)"
        >
          <span v-if="downloading" class="spinner-small"></span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          {{ downloading ? 'Downloading...' : 'Download' }}
        </button>

        <p class="security-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Files are encrypted with AES-256
        </p>
      </div>

      <!-- Footer -->
      <div class="share-footer">
        <p>Secure file sharing by <NuxtLink to="/">GuardCloud</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '~/composables/useTheme'
import { formatFileSize } from '~/utils/fileIcons'

interface FileInfo {
  filename: string
  size: number
  has_password: boolean
}

const route = useRoute()
const { init: initTheme } = useTheme()
const token = computed(() => route.params.token as string)

const loading = ref(true)
const error = ref<string | null>(null)
const errorTitle = ref('File not found')
const fileInfo = ref<FileInfo | null>(null)
const password = ref('')
const passwordError = ref('')
const passwordVerified = ref(false)
const downloading = ref(false)

const fileIconPath = computed(() => {
  const filename = fileInfo.value?.filename || ''
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  const iconPaths: Record<string, string> = {
    // Images
    jpg: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    jpeg: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    png: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    gif: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    // Videos
    mp4: 'M23 7l-7 5 7 5V7z M14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
    mov: 'M23 7l-7 5 7 5V7z M14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
    // Audio
    mp3: 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    wav: 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    // Documents
    pdf: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    docx: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    txt: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    // Archives
    zip: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 12h1 M10 15h1 M10 18h1',
  }
  
  return iconPaths[ext] || 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6'
})

const fileIconClass = computed(() => {
  const filename = fileInfo.value?.filename || ''
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const videoExts = ['mp4', 'webm', 'avi', 'mov']
  const audioExts = ['mp3', 'wav', 'ogg', 'flac']
  const docExts = ['pdf', 'doc', 'docx', 'txt']
  const archiveExts = ['zip', 'rar', '7z']
  
  if (imageExts.includes(ext)) return 'icon-image'
  if (videoExts.includes(ext)) return 'icon-video'
  if (audioExts.includes(ext)) return 'icon-audio'
  if (docExts.includes(ext)) return 'icon-document'
  if (archiveExts.includes(ext)) return 'icon-archive'
  return 'icon-default'
})

function formatSize(bytes: number) {
  return formatFileSize(bytes)
}

onMounted(async () => {
  initTheme()
  await loadFileInfo()
})

async function loadFileInfo() {
  loading.value = true
  error.value = null

  try {
    const res = await fetch(`http://127.0.0.1:8000/share/${token.value}`)
    
    if (!res.ok) {
      const data = await res.json()
      
      if (res.status === 404) {
        errorTitle.value = 'File not found'
        error.value = 'This share link does not exist or has been deleted.'
      } else if (res.status === 410) {
        errorTitle.value = 'Link expired'
        error.value = data.detail || 'This share link has expired or reached its download limit.'
      } else {
        error.value = data.detail || 'An error occurred'
      }
      return
    }

    fileInfo.value = await res.json()
  } catch (err) {
    error.value = 'Could not load file information'
  } finally {
    loading.value = false
  }
}

async function downloadFile() {
  if (fileInfo.value?.has_password && !password.value) {
    passwordError.value = 'Password is required'
    return
  }

  downloading.value = true
  passwordError.value = ''

  try {
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }

    if (fileInfo.value?.has_password) {
      options.body = JSON.stringify({ password: password.value })
    }

    const res = await fetch(`http://127.0.0.1:8000/share/${token.value}/download`, options)

    if (!res.ok) {
      const data = await res.json()
      
      if (res.status === 401) {
        passwordError.value = 'Incorrect password'
        return
      } else if (res.status === 410) {
        errorTitle.value = 'Link expired'
        error.value = data.detail || 'This share link has expired or reached its download limit.'
        return
      }
      
      error.value = data.detail || 'Download failed'
      return
    }

    // Download the file
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileInfo.value?.filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    passwordVerified.value = true
  } catch (err) {
    error.value = 'Download failed. Please try again.'
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.share-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--gc-bg-secondary) 0%, var(--gc-bg-primary) 100%);
  padding: 20px;
}

.share-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  text-decoration: none;
}

.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-text {
  font-size: 26px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--gc-text-secondary);
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gc-border);
  border-top-color: var(--gc-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.15);
}

.error-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gc-error-soft);
  border-radius: 50%;
  margin: 0 auto 20px;
  color: var(--gc-error);
}

.error-icon svg {
  width: 36px;
  height: 36px;
}

.error-state h2 {
  margin: 0 0 10px;
  font-size: 22px;
  color: var(--gc-text-primary);
}

.error-state p {
  color: var(--gc-text-secondary);
  margin-bottom: 28px;
  font-size: 15px;
}

.file-card {
  width: 100%;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 20px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.15);
}

.file-icon-wrap {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gc-bg-secondary);
  border-radius: 20px;
  margin: 0 auto 20px;
  color: var(--gc-text-secondary);
}

.file-icon-wrap svg {
  width: 40px;
  height: 40px;
}

.file-icon-wrap.icon-image {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.file-icon-wrap.icon-video {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.file-icon-wrap.icon-audio {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.file-icon-wrap.icon-document {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.file-icon-wrap.icon-archive {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.file-name {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--gc-text-primary);
  word-break: break-all;
}

.file-size {
  margin: 0 0 28px;
  color: var(--gc-text-secondary);
  font-size: 15px;
}

.password-section {
  margin-bottom: 28px;
}

.password-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--gc-text-secondary);
  margin: 0 0 14px;
  font-size: 14px;
}

.password-label svg {
  width: 18px;
  height: 18px;
}

.password-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 15px;
  text-align: center;
  transition: all 0.2s;
}

.password-input:focus {
  outline: none;
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: var(--gc-bg-primary);
}

.password-error {
  color: var(--gc-error);
  font-size: 14px;
  margin: 10px 0 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn svg {
  width: 20px;
  height: 20px;
}

.btn-primary {
  background: var(--gc-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--gc-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-large {
  width: 100%;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 24px 0 0;
  font-size: 13px;
  color: var(--gc-text-secondary);
}

.security-note svg {
  width: 16px;
  height: 16px;
  color: var(--gc-success);
}

.share-footer {
  margin-top: 28px;
  text-align: center;
}

.share-footer p {
  color: var(--gc-text-secondary);
  font-size: 14px;
  margin: 0;
}

.share-footer a {
  color: var(--gc-primary);
  text-decoration: none;
  font-weight: 500;
}

.share-footer a:hover {
  text-decoration: underline;
}
</style>
