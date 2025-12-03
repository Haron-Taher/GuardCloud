<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthState } from '~/composables/useAuth'
import { useFilesState, type FileItem as ApiFileItem } from '~/composables/useFiles'
import { GcButton } from '~/components/ui'
import DashboardTopBar from '~/components/dashboard/DashboardTopBar.vue'
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardFileGrid, { type FileItem } from '~/components/dashboard/DashboardFileGrid.vue'

const router = useRouter()
const { authState, logout, isLoggedIn } = useAuthState()
const { files, loading, error, fetchFiles, upload, download, deleteFile, clearError } = useFilesState()

// State
const section = ref<'drive' | 'shared' | 'recent' | 'starred' | 'trash'>('drive')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedFile = ref<FileItem | null>(null)
const dragActive = ref(false)
const uploadProgress = ref(0)
const isUploading = ref(false)
const showLogoutConfirm = ref(false)
const starredIds = ref<Set<string>>(new Set())

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null)

// Redirect if not logged in
onMounted(() => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  
  // Load files
  fetchFiles()
  
  // Load starred files from localStorage
  if (process.client) {
    const stored = localStorage.getItem('gc_starred')
    if (stored) {
      try {
        starredIds.value = new Set(JSON.parse(stored))
      } catch {
        // Ignore invalid JSON
      }
    }
  }
})

// Watch for auth changes
watch(isLoggedIn, (loggedIn) => {
  if (!loggedIn) {
    router.push('/login')
  }
})

// Save starred files when changed
watch(starredIds, (ids) => {
  if (process.client) {
    localStorage.setItem('gc_starred', JSON.stringify([...ids]))
  }
}, { deep: true })

// Transform API files to our format
const transformedFiles = computed<FileItem[]>(() => {
  return files.value.map(f => ({
    id: String(f.id),
    name: f.filename,
    type: 'file',
    size: f.size,
    modified: f.created_at ? new Date(f.created_at).getTime() : Date.now(),
    owner: authState.username || 'You',
    starred: starredIds.value.has(String(f.id)),
  }))
})

// Filter files based on section and search
const filteredFiles = computed<FileItem[]>(() => {
  let result = [...transformedFiles.value]
  
  // Filter by section
  switch (section.value) {
    case 'starred':
      result = result.filter(f => f.starred)
      break
    case 'recent':
      result = result.sort((a, b) => b.modified - a.modified).slice(0, 20)
      break
    case 'trash':
      result = [] // Trash is not implemented yet
      break
    case 'shared':
      result = [] // Shared is not implemented yet
      break
  }
  
  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(f => f.name.toLowerCase().includes(query))
  }
  
  return result
})

// Storage calculations
const storageUsed = computed(() => {
  return transformedFiles.value.reduce((sum, f) => sum + f.size, 0)
})

const storageTotal = 15 * 1024 * 1024 * 1024 // 15 GB

// Section title
const sectionTitle = computed(() => {
  const titles: Record<string, string> = {
    drive: 'My Drive',
    shared: 'Shared with me',
    recent: 'Recent',
    starred: 'Starred',
    trash: 'Trash',
  }
  return titles[section.value] || 'Files'
})

// Handlers
const handleSearch = (query: string) => {
  searchQuery.value = query
  selectedFile.value = null
}

const handleNavigate = (newSection: string) => {
  section.value = newSection as typeof section.value
  selectedFile.value = null
  searchQuery.value = ''
}

const handleUploadClick = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const fileList = input.files
  if (!fileList?.length) return
  
  await uploadFiles(Array.from(fileList))
  input.value = '' // Reset input for re-upload
}

const uploadFiles = async (fileList: File[]) => {
  if (!fileList.length) return
  
  isUploading.value = true
  uploadProgress.value = 0
  clearError()
  
  try {
    const total = fileList.length
    let completed = 0
    
    for (const file of fileList) {
      const success = await upload(file, (percent) => {
        // Calculate overall progress
        const baseProgress = (completed / total) * 100
        const fileProgress = (percent / total)
        uploadProgress.value = Math.round(baseProgress + fileProgress)
      })
      
      if (success) {
        completed++
      }
    }
    
    uploadProgress.value = 100
  } finally {
    // Keep progress bar visible briefly before hiding
    setTimeout(() => {
      isUploading.value = false
      uploadProgress.value = 0
    }, 500)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragActive.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  // Only deactivate if leaving the main container
  if (!event.relatedTarget || !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    dragActive.value = false
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  dragActive.value = false
  
  const fileList = event.dataTransfer?.files
  if (fileList?.length) {
    await uploadFiles(Array.from(fileList))
  }
}

const handleNewFolder = () => {
  // TODO: Implement folder creation
  alert('Folder creation coming soon!')
}

const handleLogoutClick = () => {
  showLogoutConfirm.value = true
}

const confirmLogout = () => {
  showLogoutConfirm.value = false
  logout()
  router.push('/login')
}

const cancelLogout = () => {
  showLogoutConfirm.value = false
}

const handleSelectFile = (file: FileItem) => {
  selectedFile.value = file
}

const handleOpenFile = async (file: FileItem) => {
  // Find original file and download
  const originalFile = files.value.find(f => String(f.id) === String(file.id))
  if (originalFile) {
    await download(originalFile)
  }
}

const handleStarFile = (file: FileItem) => {
  const id = String(file.id)
  if (starredIds.value.has(id)) {
    starredIds.value.delete(id)
  } else {
    starredIds.value.add(id)
  }
  // Trigger reactivity
  starredIds.value = new Set(starredIds.value)
}

const handleDeleteFile = async (file: FileItem) => {
  if (!confirm(`Delete "${file.name}"? This action cannot be undone.`)) return
  
  const originalFile = files.value.find(f => String(f.id) === String(file.id))
  if (originalFile) {
    await deleteFile(originalFile)
    selectedFile.value = null
  }
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Focus search on /
  if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
    event.preventDefault()
    const searchInput = document.querySelector('.topbar__search input') as HTMLInputElement
    searchInput?.focus()
  }
  
  // Delete selected file
  if (event.key === 'Delete' && selectedFile.value) {
    handleDeleteFile(selectedFile.value)
  }
  
  // Escape to deselect
  if (event.key === 'Escape') {
    selectedFile.value = null
    showLogoutConfirm.value = false
  }
}

onMounted(() => {
  if (process.client) {
    document.addEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div 
    class="dashboard"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Top Bar -->
    <DashboardTopBar
      :username="authState.username"
      :email="authState.email"
      @search="handleSearch"
      @upload="handleUploadClick"
      @new-folder="handleNewFolder"
      @logout="handleLogoutClick"
    />

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      class="sr-only"
      @change="handleFileSelect"
    />

    <!-- Upload progress -->
    <Transition name="slide-down">
      <div v-if="isUploading" class="upload-progress">
        <div class="upload-progress__bar" :style="{ width: `${uploadProgress}%` }"></div>
        <span class="upload-progress__text">Uploading... {{ uploadProgress }}%</span>
      </div>
    </Transition>

    <!-- Error banner -->
    <Transition name="slide-down">
      <div v-if="error" class="error-banner">
        <span>{{ error }}</span>
        <button @click="clearError" class="error-banner__close">×</button>
      </div>
    </Transition>

    <!-- Main layout -->
    <div class="dashboard__layout">
      <!-- Sidebar -->
      <DashboardSidebar
        :active-section="section"
        :storage-used="storageUsed"
        :storage-total="storageTotal"
        @navigate="handleNavigate"
      />

      <!-- Content -->
      <main class="dashboard__content">
        <!-- Header -->
        <div class="content-header">
          <div class="content-header__left">
            <h1>{{ sectionTitle }}</h1>
            <span class="content-header__count">{{ filteredFiles.length }} items</span>
          </div>

          <div class="content-header__right">
            <div class="view-toggle">
              <button 
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
                title="Grid view"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button 
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
                title="List view"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <rect x="3" y="4" width="18" height="2" rx="1" />
                  <rect x="3" y="11" width="18" height="2" rx="1" />
                  <rect x="3" y="18" width="18" height="2" rx="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Files -->
        <DashboardFileGrid
          :files="filteredFiles"
          :view-mode="viewMode"
          :selected-id="selectedFile?.id"
          :loading="loading"
          @select="handleSelectFile"
          @open="handleOpenFile"
          @star="handleStarFile"
        />

        <!-- Empty state for sections -->
        <div v-if="!loading && filteredFiles.length === 0 && section !== 'drive'" class="empty-section">
          <template v-if="section === 'starred'">
            <span class="empty-icon">⭐</span>
            <h3>No starred files</h3>
            <p>Star important files to find them quickly here.</p>
          </template>
          <template v-else-if="section === 'shared'">
            <span class="empty-icon">👥</span>
            <h3>Nothing shared yet</h3>
            <p>Files shared with you will appear here.</p>
          </template>
          <template v-else-if="section === 'trash'">
            <span class="empty-icon">🗑️</span>
            <h3>Trash is empty</h3>
            <p>Items you delete will appear here.</p>
          </template>
        </div>
      </main>
    </div>

    <!-- Drop overlay -->
    <Transition name="fade">
      <div v-if="dragActive" class="drop-overlay">
        <div class="drop-overlay__content">
          <span class="drop-overlay__icon">📤</span>
          <h3>Drop files to upload</h3>
          <p>Files will be encrypted before upload</p>
        </div>
      </div>
    </Transition>

    <!-- Logout confirmation modal -->
    <Transition name="fade">
      <div v-if="showLogoutConfirm" class="modal-overlay" @click.self="cancelLogout">
        <div class="modal">
          <div class="modal__icon">👋</div>
          <h3>Sign out?</h3>
          <p>Are you sure you want to sign out of your account?</p>
          <div class="modal__actions">
            <GcButton variant="ghost" @click="cancelLogout">Cancel</GcButton>
            <GcButton variant="danger" @click="confirmLogout">Sign out</GcButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--gc-bg);
  color: var(--gc-text);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Upload progress */
.upload-progress {
  position: fixed;
  top: 61px;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gc-border);
  z-index: 100;
}

.upload-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--gc-accent), color-mix(in srgb, var(--gc-accent) 70%, #fff));
  transition: width 0.2s ease;
}

.upload-progress__text {
  position: absolute;
  right: 16px;
  top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gc-accent);
}

/* Error banner */
.error-banner {
  position: fixed;
  top: 61px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--gc-error);
  color: #fff;
  border-radius: var(--gc-radius-lg);
  font-size: 14px;
  box-shadow: var(--gc-shadow-lg);
  z-index: 100;
}

.error-banner__close {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.8;
}

.error-banner__close:hover {
  opacity: 1;
}

/* Layout */
.dashboard__layout {
  display: grid;
  grid-template-columns: 240px 1fr;
}

@media (max-width: 768px) {
  .dashboard__layout {
    grid-template-columns: 64px 1fr;
  }
}

/* Content */
.dashboard__content {
  padding: 24px;
  min-height: calc(100vh - 61px);
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.content-header__left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.content-header__left h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.content-header__count {
  font-size: 14px;
  color: var(--gc-text-muted);
}

.content-header__right {
  display: flex;
  gap: 12px;
}

.view-toggle {
  display: flex;
  border: 1px solid var(--gc-border);
  border-radius: var(--gc-radius-md);
  overflow: hidden;
}

.view-toggle button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--gc-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.view-toggle button:not(:last-child) {
  border-right: 1px solid var(--gc-border);
}

.view-toggle button:hover {
  background: var(--gc-card);
}

.view-toggle button.active {
  background: var(--gc-accent-light);
  color: var(--gc-accent);
}

/* Empty section state */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 24px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

.empty-section p {
  font-size: 14px;
  color: var(--gc-text-muted);
  margin: 0;
}

/* Drop overlay */
.drop-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--gc-bg) 80%, transparent);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.drop-overlay__content {
  text-align: center;
  background: var(--gc-card);
  border: 2px dashed var(--gc-accent);
  border-radius: var(--gc-radius-xl);
  padding: 48px 64px;
}

.drop-overlay__icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.drop-overlay__content h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
}

.drop-overlay__content p {
  font-size: 14px;
  color: var(--gc-text-muted);
  margin: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 24px;
}

.modal {
  background: var(--gc-bg);
  border: 1px solid var(--gc-border);
  border-radius: var(--gc-radius-xl);
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal__icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
}

.modal p {
  font-size: 14px;
  color: var(--gc-text-muted);
  margin: 0 0 24px;
}

.modal__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
