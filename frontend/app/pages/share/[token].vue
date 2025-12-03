<template>
  <div class="share-page">
    <div class="share-container">
      <!-- Logo -->
      <div class="logo">
        <span class="logo-icon">☁️</span>
        <span class="logo-text">GuardCloud</span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <span class="error-icon">⚠️</span>
        <h2>{{ errorTitle }}</h2>
        <p>{{ error }}</p>
        <NuxtLink to="/" class="btn btn-primary">Go to homepage</NuxtLink>
      </div>

      <!-- File Info -->
      <div v-else class="file-card">
        <div class="file-icon">{{ fileIcon }}</div>
        <h2 class="file-name">{{ fileInfo?.filename }}</h2>
        <p class="file-size">{{ formatSize(fileInfo?.size || 0) }}</p>

        <!-- Password Input -->
        <div v-if="fileInfo?.has_password && !passwordVerified" class="password-section">
          <p>This file is password protected</p>
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
          <span v-if="downloading">Downloading...</span>
          <span v-else>⬇️ Download</span>
        </button>

        <p class="security-note">
          🔒 Files are encrypted with AES-256
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
import { getFileEmoji, formatFileSize } from '~/utils/fileIcons'

interface FileInfo {
  filename: string
  size: number
  has_password: boolean
}

const route = useRoute()
const token = computed(() => route.params.token as string)

const loading = ref(true)
const error = ref<string | null>(null)
const errorTitle = ref('File not found')
const fileInfo = ref<FileInfo | null>(null)
const password = ref('')
const passwordError = ref('')
const passwordVerified = ref(false)
const downloading = ref(false)

const fileIcon = computed(() => {
  return getFileEmoji(fileInfo.value?.filename || '', false)
})

function formatSize(bytes: number) {
  return formatFileSize(bytes)
}

onMounted(async () => {
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
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px;
}

.share-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--gc-text-secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--gc-border);
  border-top-color: var(--gc-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  background: var(--gc-bg-primary);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.error-icon {
  font-size: 48px;
}

.error-state h2 {
  margin: 16px 0 8px;
  color: var(--gc-text-primary);
}

.error-state p {
  color: var(--gc-text-secondary);
  margin-bottom: 24px;
}

.file-card {
  width: 100%;
  background: var(--gc-bg-primary);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.file-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.file-name {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--gc-text-primary);
  word-break: break-all;
}

.file-size {
  margin: 0 0 24px;
  color: var(--gc-text-secondary);
}

.password-section {
  margin-bottom: 24px;
}

.password-section p {
  color: var(--gc-text-secondary);
  margin: 0 0 12px;
  font-size: 14px;
}

.password-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 15px;
  text-align: center;
}

.password-input:focus {
  outline: none;
  border-color: var(--gc-primary);
}

.password-error {
  color: var(--gc-error);
  font-size: 14px;
  margin: 8px 0 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: var(--gc-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--gc-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-large {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
}

.security-note {
  margin: 20px 0 0;
  font-size: 13px;
  color: var(--gc-text-secondary);
}

.share-footer {
  margin-top: 24px;
  text-align: center;
}

.share-footer p {
  color: var(--gc-text-secondary);
  font-size: 14px;
}

.share-footer a {
  color: var(--gc-primary);
  text-decoration: none;
}

.share-footer a:hover {
  text-decoration: underline;
}
</style>
