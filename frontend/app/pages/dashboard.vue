<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthState } from '~/composables/useAuth'
import { useFilesState } from '~/composables/useFiles'
import { GcButton } from '~/components/ui'
import DashboardTopBar from '~/components/dashboard/DashboardTopBar.vue'
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardFileGrid, { type FileItem } from '~/components/dashboard/DashboardFileGrid.vue'

const router = useRouter()
const { authState, logout } = useAuthState()
const { files, loading, fetchFiles, upload, download } = useFilesState()

// State
const section = ref<'drive' | 'shared' | 'recent' | 'starred' | 'trash'>('drive')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedFile = ref<FileItem | null>(null)
const dragActive = ref(false)
const uploadProgress = ref(0)
const isUploading = ref(false)

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null)

// Transform API files to our format
const transformedFiles = computed<FileItem[]>(() => {
  return files.value.map(f => ({
    id: String(f.id),
    name: f.filename,
    type: 'file',
    size: f.size,
    modified: f.created_at ? new Date(f.created_at).getTime() : Date.now(),
    owner: authState.username || 'You',
    starred: false,
  }))
})

// Filter files based on section and search
const filteredFiles = computed<FileItem[]>(() => {
  let result = [...transformedFiles.value]
  
  // Filter by section
  if (section.value === 'starred') {
    result = result.filter(f => f.starred)
  } else if (section.value === 'recent') {
    result = result.sort((a, b) => b.modified - a.modified).slice(0, 10)
  } else if (section.value === 'trash') {
    result = []
  }
  
  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
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
}

const handleUploadClick = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const fileList = input.files
  if (!fileList?.length) return
  
  await uploadFiles(Array.from(fileList))
  input.value = ''
}

const uploadFiles = async (fileList: File[]) => {
  if (!fileList.length) return
  
  isUploading.value = true
  uploadProgress.value = 0
  
  try {
    const total = fileList.length
    let completed = 0
    
    for (const file of fileList) {
      await upload(file)
      completed++
      uploadProgress.value = Math.round((completed / total) * 100)
    }
    
    await fetchFiles()
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const handleDrop = async (event: DragEvent) => {
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

const handleLogout = () => {
  logout()
  router.push('/login')
}

const handleSelectFile = (file: FileItem) => {
  selectedFile.value = file
}

const handleOpenFile = async (file: FileItem) => {
  // Download file
  const originalFile = files.value.find(f => String(f.id) === String(file.id))
  if (originalFile) {
    await download(originalFile)
  }
}

const handleStarFile = (file: FileItem) => {
  // Toggle star (local only for now)
  const idx = transformedFiles.value.findIndex(f => f.id === file.id)
  if (idx !== -1) {
    file.starred = !file.starred
  }
}

// Initialize
onMounted(() => {
  fetchFiles()
})
</script>

<template>
  <div 
    class="dashboard"
    @dragover.prevent="dragActive = true"
    @dragleave.prevent="dragActive = false"
    @drop.prevent="handleDrop"
  >
    <!-- Top Bar -->
    <DashboardTopBar
      :username="authState.username"
      @search="handleSearch"
      @upload="handleUploadClick"
      @new-folder="handleNewFolder"
      @logout="handleLogout"
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

    <!-- Main layout -->
    <div class="dashboard__layout">
      <!-- Sidebar -->
      <DashboardSidebar
        :active-section="section"
        :storage-used="storageUsed"
        :storage-total="storageTotal"
        @navigate="(s) => section = s"
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
