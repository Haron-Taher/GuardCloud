<template>
  <div class="dashboard">
    <!-- Top Bar -->
    <DashboardTopBar
      :user="user"
      :searchQuery="searchQuery"
      @update:searchQuery="searchQuery = $event"
      @new-folder="showNewFolderDialog"
      @upload="triggerUpload"
      @upload-folder="triggerUpload"
      @logout="showLogoutConfirm = true"
      @settings="navigateSection('settings')"
      @activity="showActivityLog"
    />

    <!-- Main Content -->
    <div class="dashboard-main">
      <!-- Sidebar -->
      <DashboardSidebar
        :activeSection="activeSection"
        :storageUsed="storageStats?.used || 0"
        :storageLimit="storageStats?.limit || 15 * 1024 * 1024 * 1024"
        @navigate="navigateSection"
        @newAction="showNewActionMenu"
      />

      <!-- Content Area -->
      <main 
        class="dashboard-content"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
        @contextmenu.prevent="showBackgroundContextMenu"
      >
        <!-- Breadcrumb -->
        <div v-if="activeSection === 'drive' && path.length > 0" class="breadcrumb">
          <button class="breadcrumb-item" @click="navigateToFolder(null)">
            🏠 My Drive
          </button>
          <template v-for="(folder, index) in path" :key="folder.id">
            <span class="breadcrumb-sep">/</span>
            <button 
              class="breadcrumb-item"
              @click="navigateToFolder(folder.id)"
            >
              {{ folder.name }}
            </button>
          </template>
        </div>

        <!-- Section Header -->
        <div class="section-header">
          <h2>{{ sectionTitle }}</h2>
          <div class="view-controls">
            <button 
              class="view-btn" 
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
              title="Grid view"
            >
              ⊞
            </button>
            <button 
              class="view-btn" 
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploadProgress > 0" class="upload-progress">
          <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
          <span class="progress-text">Uploading... {{ uploadProgress }}%</span>
        </div>

        <!-- Error Banner -->
        <div v-if="error" class="error-banner">
          <span>{{ error }}</span>
          <button @click="clearError">×</button>
        </div>

        <!-- Drag Drop Overlay -->
        <div v-if="isDragging" class="drag-overlay">
          <div class="drag-content">
            <span class="drag-icon">📁</span>
            <span>Drop files to upload</span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Loading...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="isEmpty" class="empty-state">
          <span class="empty-icon">{{ emptyIcon }}</span>
          <h3>{{ emptyTitle }}</h3>
          <p>{{ emptyMessage }}</p>
          <button 
            v-if="activeSection === 'drive'" 
            class="btn btn-primary"
            @click="triggerUpload"
          >
            Upload files
          </button>
        </div>

        <!-- File Grid/List -->
        <div v-else :class="['file-container', viewMode]">
          <!-- Folders -->
          <div 
            v-for="folder in displayFolders"
            :key="'folder-' + folder.id"
            class="file-item folder"
            :class="{ selected: selectedItem?.type === 'folder' && selectedItem?.id === folder.id }"
            @click="selectItem('folder', folder)"
            @dblclick="navigateToFolder(folder.id)"
            @contextmenu.prevent="showContextMenu($event, 'folder', folder)"
          >
            <span class="file-icon">📁</span>
            <span class="file-name">{{ folder.name }}</span>
            <span v-if="viewMode === 'list'" class="file-date">{{ formatDate(folder.created_at) }}</span>
          </div>

          <!-- Files -->
          <div 
            v-for="file in displayFiles"
            :key="'file-' + file.id"
            class="file-item"
            :class="{ 
              selected: selectedItem?.type === 'file' && selectedItem?.id === file.id,
              starred: starredIds.has(file.id)
            }"
            @click="selectItem('file', file)"
            @dblclick="openFile(file)"
            @contextmenu.prevent="showContextMenu($event, activeSection === 'trash' ? 'trash' : 'file', file)"
          >
            <span class="file-icon">{{ getFileEmoji(file.filename, false) }}</span>
            <span class="file-name">{{ file.filename }}</span>
            <span v-if="viewMode === 'list'" class="file-size">{{ formatSize(file.size) }}</span>
            <span v-if="viewMode === 'list'" class="file-date">
              {{ activeSection === 'trash' ? formatDate(file.trashed_at) : formatDate(file.created_at) }}
            </span>
            <button 
              v-if="activeSection !== 'trash'"
              class="star-btn"
              :class="{ active: starredIds.has(file.id) }"
              @click.stop="toggleStar(file)"
              title="Star file"
            >
              {{ starredIds.has(file.id) ? '⭐' : '☆' }}
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Hidden file input -->
    <input 
      ref="fileInput"
      type="file"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Context Menu -->
    <ContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :type="contextMenu.type"
      :starred="contextMenu.starred"
      @action="handleContextAction"
      @close="closeContextMenu"
    />

    <!-- Share Dialog -->
    <ShareDialog
      :visible="shareDialog.visible"
      :file="shareDialog.file"
      @close="shareDialog.visible = false"
    />

    <!-- File Preview Modal -->
    <FilePreviewModal
      :visible="previewModal.visible"
      :file="previewModal.file"
      @close="previewModal.visible = false"
      @download="downloadSelectedFile"
      @share="openShareDialog(previewModal.file)"
    />

    <!-- Move Dialog -->
    <MoveDialog
      :visible="moveDialog.visible"
      :itemName="moveDialog.itemName"
      :itemId="moveDialog.itemId"
      :itemType="moveDialog.itemType"
      :currentFolderId="currentFolderId"
      @close="moveDialog.visible = false"
      @move="handleMove"
    />

    <!-- Rename Dialog -->
    <RenameDialog
      :visible="renameDialog.visible"
      :currentName="renameDialog.currentName"
      :type="renameDialog.type"
      @close="renameDialog.visible = false"
      @rename="handleRename"
    />

    <!-- New Folder Dialog -->
    <Teleport to="body">
      <div v-if="newFolderDialog.visible" class="modal-backdrop" @click.self="newFolderDialog.visible = false">
        <div class="modal-content small-dialog">
          <div class="modal-header">
            <h3>New folder</h3>
            <button class="close-btn" @click="newFolderDialog.visible = false">×</button>
          </div>
          <div class="modal-body">
            <input 
              ref="newFolderInput"
              v-model="newFolderDialog.name"
              type="text"
              placeholder="Folder name"
              class="dialog-input"
              @keyup.enter="createNewFolder"
              @keyup.escape="newFolderDialog.visible = false"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="newFolderDialog.visible = false">Cancel</button>
            <button 
              class="btn btn-primary" 
              @click="createNewFolder"
              :disabled="!newFolderDialog.name.trim()"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Dialog -->
    <Teleport to="body">
      <div v-if="deleteConfirm.visible" class="modal-backdrop" @click.self="deleteConfirm.visible = false">
        <div class="modal-content small-dialog">
          <div class="modal-header">
            <h3>{{ deleteConfirm.permanent ? 'Delete permanently?' : 'Move to trash?' }}</h3>
            <button class="close-btn" @click="deleteConfirm.visible = false">×</button>
          </div>
          <div class="modal-body">
            <p>
              {{ deleteConfirm.permanent 
                ? `"${deleteConfirm.itemName}" will be permanently deleted. This cannot be undone.`
                : `"${deleteConfirm.itemName}" will be moved to trash.`
              }}
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="deleteConfirm.visible = false">Cancel</button>
            <button class="btn btn-danger" @click="confirmDelete">
              {{ deleteConfirm.permanent ? 'Delete permanently' : 'Move to trash' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Logout Confirmation -->
    <Teleport to="body">
      <div v-if="showLogoutConfirm" class="modal-backdrop" @click.self="showLogoutConfirm = false">
        <div class="modal-content small-dialog">
          <div class="modal-header">
            <h3>Sign out?</h3>
            <button class="close-btn" @click="showLogoutConfirm = false">×</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to sign out?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showLogoutConfirm = false">Cancel</button>
            <button class="btn btn-primary" @click="handleLogout">Sign out</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Activity Log Modal -->
    <Teleport to="body">
      <div v-if="activityLog.visible" class="modal-backdrop" @click.self="activityLog.visible = false">
        <div class="modal-content activity-dialog">
          <div class="modal-header">
            <h3>Activity</h3>
            <button class="close-btn" @click="activityLog.visible = false">×</button>
          </div>
          <div class="modal-body activity-body">
            <div v-if="activityLog.items.length === 0" class="empty-activity">
              No activity yet
            </div>
            <div v-else class="activity-list">
              <div v-for="item in activityLog.items" :key="item.id" class="activity-item">
                <span class="activity-icon">{{ getActivityIcon(item.action) }}</span>
                <div class="activity-content">
                  <span class="activity-action">{{ formatActivityAction(item) }}</span>
                  <span class="activity-time">{{ formatDate(item.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useFiles } from '~/composables/useFiles'
import { getFileEmoji, formatFileSize, formatFileDate } from '~/utils/fileIcons'
import DashboardTopBar from '~/components/dashboard/DashboardTopBar.vue'
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import ContextMenu from '~/components/dashboard/ContextMenu.vue'
import ShareDialog from '~/components/dashboard/ShareDialog.vue'
import FilePreviewModal from '~/components/dashboard/FilePreviewModal.vue'
import MoveDialog from '~/components/dashboard/MoveDialog.vue'
import RenameDialog from '~/components/dashboard/RenameDialog.vue'

interface FileItem {
  id: number
  filename: string
  size: number
  mime_type?: string
  folder_id?: number
  created_at: string
  trashed_at?: string
}

interface FolderItem {
  id: number
  name: string
  parent_id?: number
  created_at: string
}

const router = useRouter()
const { authState, logout } = useAuth()
const { 
  files, folders, path, currentFolderId, loading, error, uploadProgress, storageStats,
  fetchFiles, fetchTrash, searchFiles, upload, download, trashFile, restoreFile, deleteFile,
  renameFile, moveFile, createFolder, renameFolder, deleteFolder, fetchStorageStats, clearError,
  getActivity
} = useFiles()

// User info
const user = computed(() => ({
  username: authState.value.username || 'User',
  email: authState.value.email || ''
}))

// View state
const activeSection = ref<'drive' | 'shared' | 'recent' | 'starred' | 'trash'>('drive')
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const isDragging = ref(false)
const showLogoutConfirm = ref(false)

// Selection state
const selectedItem = ref<{ type: 'file' | 'folder'; id: number; data: any } | null>(null)

// Starred files (stored in localStorage)
const starredIds = ref<Set<number>>(new Set())

// Search results
const searchResults = ref<FileItem[]>([])

// Trash files
const trashFiles = ref<FileItem[]>([])

// File input ref
const fileInput = ref<HTMLInputElement | null>(null)
const newFolderInput = ref<HTMLInputElement | null>(null)

// Context menu state
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  type: 'background' as 'file' | 'folder' | 'trash' | 'background',
  item: null as any,
  starred: false
})

// Dialogs
const shareDialog = ref({
  visible: false,
  file: null as FileItem | null
})

const previewModal = ref({
  visible: false,
  file: null as FileItem | null
})

const moveDialog = ref({
  visible: false,
  itemName: '',
  itemId: 0,
  itemType: 'file' as 'file' | 'folder'
})

const renameDialog = ref({
  visible: false,
  currentName: '',
  type: 'file' as 'file' | 'folder',
  item: null as any
})

const newFolderDialog = ref({
  visible: false,
  name: ''
})

const deleteConfirm = ref({
  visible: false,
  itemName: '',
  itemId: 0,
  itemType: 'file' as 'file' | 'folder',
  permanent: false
})

// Computed display data
const displayFiles = computed(() => {
  if (searchQuery.value.trim()) {
    return searchResults.value
  }
  
  if (activeSection.value === 'starred') {
    return files.value.filter(f => starredIds.value.has(f.id))
  }
  
  if (activeSection.value === 'trash') {
    return trashFiles.value
  }
  
  return files.value
})

const displayFolders = computed(() => {
  if (searchQuery.value.trim() || activeSection.value !== 'drive') {
    return []
  }
  return folders.value
})

const isEmpty = computed(() => {
  return displayFiles.value.length === 0 && displayFolders.value.length === 0
})

const sectionTitle = computed(() => {
  if (searchQuery.value.trim()) return `Search: "${searchQuery.value}"`
  const titles: Record<string, string> = {
    drive: 'My Drive',
    shared: 'Shared with me',
    recent: 'Recent',
    starred: 'Starred',
    trash: 'Trash'
  }
  return titles[activeSection.value]
})

const emptyIcon = computed(() => {
  const icons: Record<string, string> = {
    drive: '📁',
    shared: '👥',
    recent: '🕐',
    starred: '⭐',
    trash: '🗑️'
  }
  return icons[activeSection.value]
})

const emptyTitle = computed(() => {
  const titles: Record<string, string> = {
    drive: 'No files yet',
    shared: 'Nothing shared with you',
    recent: 'No recent files',
    starred: 'No starred files',
    trash: 'Trash is empty'
  }
  return titles[activeSection.value]
})

const emptyMessage = computed(() => {
  const messages: Record<string, string> = {
    drive: 'Upload files to get started',
    shared: 'Files shared with you will appear here',
    recent: 'Files you open will appear here',
    starred: 'Star files to find them easily',
    trash: 'Deleted files will appear here'
  }
  return messages[activeSection.value]
})

// Format helpers
function formatSize(bytes: number) {
  return formatFileSize(bytes)
}

function formatDate(dateStr: string) {
  return formatFileDate(dateStr)
}

// Load initial data
onMounted(async () => {
  // Check auth
  if (!authState.value.isAuthenticated) {
    router.push('/login')
    return
  }

  // Load starred from localStorage
  const saved = localStorage.getItem('gc_starred')
  if (saved) {
    try {
      starredIds.value = new Set(JSON.parse(saved))
    } catch {}
  }

  // Load files and storage stats
  await fetchFiles(null)
  await fetchStorageStats()
})

// Search debounce
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, async (query) => {
  clearTimeout(searchTimeout)
  
  if (!query.trim()) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    searchResults.value = await searchFiles(query)
  }, 300)
})

// Navigation
function navigateSection(section: string) {
  // Handle settings page navigation
  if (section === 'settings') {
    router.push('/settings')
    return
  }
  
  activeSection.value = section as any
  searchQuery.value = ''
  selectedItem.value = null
  
  if (section === 'drive') {
    fetchFiles(null)
  } else if (section === 'trash') {
    loadTrash()
  }
}

async function loadTrash() {
  trashFiles.value = await fetchTrash()
}

function navigateToFolder(folderId: number | null) {
  fetchFiles(folderId)
}

// Selection
function selectItem(type: 'file' | 'folder', item: any) {
  selectedItem.value = { type, id: item.id, data: item }
}

// File operations
function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const fileList = input.files
  if (!fileList?.length) return

  for (const file of Array.from(fileList)) {
    await upload(file, currentFolderId.value)
  }

  input.value = ''
}

function openFile(file: FileItem) {
  const mime = file.mime_type || ''
  
  // Preview for supported types
  if (mime.startsWith('image/') || mime.startsWith('text/') || 
      mime === 'application/pdf' || mime === 'application/json') {
    previewModal.value = { visible: true, file }
  } else {
    download(file)
  }
}

function downloadSelectedFile() {
  if (previewModal.value.file) {
    download(previewModal.value.file)
  } else if (selectedItem.value?.type === 'file') {
    download(selectedItem.value.data)
  }
}

function toggleStar(file: FileItem) {
  if (starredIds.value.has(file.id)) {
    starredIds.value.delete(file.id)
  } else {
    starredIds.value.add(file.id)
  }
  
  // Save to localStorage
  localStorage.setItem('gc_starred', JSON.stringify([...starredIds.value]))
}

// Context menu
function showContextMenu(e: MouseEvent, type: 'file' | 'folder' | 'trash', item: any) {
  e.preventDefault()
  
  contextMenu.value = {
    visible: true,
    x: Math.min(e.clientX, window.innerWidth - 200),
    y: Math.min(e.clientY, window.innerHeight - 300),
    type,
    item,
    starred: type === 'file' && starredIds.value.has(item.id)
  }
  
  selectItem(type === 'trash' ? 'file' : type, item)
}

function showBackgroundContextMenu(e: MouseEvent) {
  if (activeSection.value !== 'drive') return
  
  contextMenu.value = {
    visible: true,
    x: Math.min(e.clientX, window.innerWidth - 200),
    y: Math.min(e.clientY, window.innerHeight - 200),
    type: 'background',
    item: null,
    starred: false
  }
}

function closeContextMenu() {
  contextMenu.value.visible = false
}

async function handleContextAction(action: string) {
  closeContextMenu()
  const item = contextMenu.value.item
  
  switch (action) {
    case 'open':
      if (contextMenu.value.type === 'folder') {
        navigateToFolder(item.id)
      } else {
        openFile(item)
      }
      break
      
    case 'download':
      download(item)
      break
      
    case 'preview':
      previewModal.value = { visible: true, file: item }
      break
      
    case 'share':
      openShareDialog(item)
      break
      
    case 'move':
      moveDialog.value = {
        visible: true,
        itemName: item.filename || item.name,
        itemId: item.id,
        itemType: contextMenu.value.type as 'file' | 'folder'
      }
      break
      
    case 'rename':
      renameDialog.value = {
        visible: true,
        currentName: item.filename || item.name,
        type: contextMenu.value.type as 'file' | 'folder',
        item
      }
      break
      
    case 'star':
      toggleStar(item)
      break
      
    case 'trash':
      deleteConfirm.value = {
        visible: true,
        itemName: item.filename || item.name,
        itemId: item.id,
        itemType: contextMenu.value.type as 'file' | 'folder',
        permanent: false
      }
      break
      
    case 'delete':
      deleteConfirm.value = {
        visible: true,
        itemName: item.name,
        itemId: item.id,
        itemType: 'folder',
        permanent: true
      }
      break
      
    case 'restore':
      await restoreFile(item)
      await loadTrash()
      break
      
    case 'delete-permanent':
      deleteConfirm.value = {
        visible: true,
        itemName: item.filename,
        itemId: item.id,
        itemType: 'file',
        permanent: true
      }
      break
      
    case 'new-folder':
      showNewFolderDialog()
      break
      
    case 'upload':
      triggerUpload()
      break
      
    case 'refresh':
      await fetchFiles(currentFolderId.value, true)
      break
  }
}

// Share dialog
function openShareDialog(file: FileItem | null) {
  if (file) {
    shareDialog.value = { visible: true, file }
  }
}

// Move handler
async function handleMove(folderId: number | null) {
  const success = await moveFile(
    { id: moveDialog.value.itemId } as FileItem,
    folderId
  )
  
  if (success) {
    moveDialog.value.visible = false
  }
}

// Rename handler
async function handleRename(newName: string) {
  const item = renameDialog.value.item
  let success = false
  
  if (renameDialog.value.type === 'file') {
    success = await renameFile(item, newName)
  } else {
    success = await renameFolder(item, newName)
  }
  
  if (success) {
    renameDialog.value.visible = false
  }
}

// New folder
function showNewFolderDialog() {
  newFolderDialog.value = { visible: true, name: '' }
  nextTick(() => {
    newFolderInput.value?.focus()
  })
}

// New action menu (from sidebar)
function showNewActionMenu() {
  // Open the new folder dialog as the default new action
  showNewFolderDialog()
}

// Activity log
const activityLog = ref<{ visible: boolean; items: any[] }>({
  visible: false,
  items: []
})

async function showActivityLog() {
  const items = await getActivity(50)
  activityLog.value = { visible: true, items }
}

function getActivityIcon(action: string): string {
  const icons: Record<string, string> = {
    upload: '⬆️',
    download: '⬇️',
    delete: '🗑️',
    trash: '🗑️',
    restore: '♻️',
    rename: '✏️',
    move: '📁',
    share: '🔗',
    create_folder: '📁',
    login: '🔐',
    signup: '🎉',
    update_profile: '⚙️',
    change_password: '🔒'
  }
  return icons[action] || '📝'
}

function formatActivityAction(item: any): string {
  const actions: Record<string, string> = {
    upload: `Uploaded ${item.target_name || 'a file'}`,
    download: `Downloaded ${item.target_name || 'a file'}`,
    delete: `Deleted ${item.target_name || 'an item'}`,
    trash: `Moved ${item.target_name || 'an item'} to trash`,
    restore: `Restored ${item.target_name || 'an item'}`,
    rename: `Renamed to ${item.target_name || 'new name'}`,
    move: `Moved ${item.target_name || 'an item'}`,
    share: `Shared ${item.target_name || 'a file'}`,
    create_folder: `Created folder ${item.target_name || ''}`,
    login: 'Signed in',
    signup: 'Created account',
    update_profile: 'Updated profile',
    change_password: 'Changed password'
  }
  return actions[item.action] || item.action
}

async function createNewFolder() {
  if (!newFolderDialog.value.name.trim()) return
  
  await createFolder(newFolderDialog.value.name, currentFolderId.value)
  newFolderDialog.value.visible = false
}

// Delete confirmation
async function confirmDelete() {
  const { itemId, itemType, permanent } = deleteConfirm.value
  
  if (itemType === 'file') {
    if (permanent) {
      await deleteFile({ id: itemId } as FileItem)
      if (activeSection.value === 'trash') {
        await loadTrash()
      }
    } else {
      await trashFile({ id: itemId } as FileItem)
    }
  } else {
    await deleteFolder({ id: itemId } as FolderItem)
  }
  
  deleteConfirm.value.visible = false
  selectedItem.value = null
}

// Drag and drop
function handleDragOver(e: DragEvent) {
  if (activeSection.value !== 'drive') return
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  isDragging.value = false
}

async function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (activeSection.value !== 'drive') return
  
  const fileList = e.dataTransfer?.files
  if (!fileList?.length) return

  for (const file of Array.from(fileList)) {
    await upload(file, currentFolderId.value)
  }
}

// Logout
async function handleLogout() {
  showLogoutConfirm.value = false
  await logout()
  router.push('/login')
}

// Keyboard shortcuts
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

function handleKeyDown(e: KeyboardEvent) {
  // Ignore if in input
  if ((e.target as HTMLElement).tagName === 'INPUT') return
  
  if (e.key === '/') {
    e.preventDefault()
    // Focus search - handled by TopBar
  } else if (e.key === 'Escape') {
    selectedItem.value = null
    closeContextMenu()
  } else if (e.key === 'Delete' && selectedItem.value) {
    deleteConfirm.value = {
      visible: true,
      itemName: selectedItem.value.data.filename || selectedItem.value.data.name,
      itemId: selectedItem.value.id,
      itemType: selectedItem.value.type,
      permanent: activeSection.value === 'trash'
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--gc-bg-secondary);
}

.dashboard-main {
  display: flex;
  flex: 1;
}

.dashboard-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  position: relative;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.breadcrumb-item {
  background: none;
  border: none;
  color: var(--gc-text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.breadcrumb-item:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

.breadcrumb-sep {
  color: var(--gc-text-secondary);
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--gc-text-primary);
}

.view-controls {
  display: flex;
  gap: 4px;
}

.view-btn {
  background: none;
  border: 1px solid var(--gc-border);
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  color: var(--gc-text-secondary);
  transition: all 0.2s;
}

.view-btn:hover {
  background: var(--gc-bg-tertiary);
}

.view-btn.active {
  background: var(--gc-primary);
  border-color: var(--gc-primary);
  color: white;
}

/* Upload Progress */
.upload-progress {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gc-bg-tertiary);
  z-index: 100;
}

.progress-bar {
  height: 100%;
  background: var(--gc-primary);
  transition: width 0.2s;
}

.progress-text {
  position: absolute;
  right: 20px;
  top: 8px;
  font-size: 12px;
  color: var(--gc-text-secondary);
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--gc-error);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: var(--gc-error);
}

.error-banner button {
  background: none;
  border: none;
  color: var(--gc-error);
  font-size: 20px;
  cursor: pointer;
}

/* Drag Overlay */
.drag-overlay {
  position: absolute;
  inset: 0;
  background: rgba(99, 102, 241, 0.1);
  border: 2px dashed var(--gc-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--gc-primary);
  font-weight: 500;
}

.drag-icon {
  font-size: 48px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
}

.empty-state h3 {
  margin: 0;
  color: var(--gc-text-primary);
  font-size: 20px;
}

.empty-state p {
  margin: 0;
  color: var(--gc-text-secondary);
}

/* File Container */
.file-container {
  display: grid;
  gap: 12px;
}

.file-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

.file-container.list {
  grid-template-columns: 1fr;
}

/* File Item */
.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.file-item:hover {
  border-color: var(--gc-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-item.selected {
  border-color: var(--gc-primary);
  background: rgba(99, 102, 241, 0.05);
}

.grid .file-item {
  flex-direction: column;
  text-align: center;
  padding: 16px 12px;
}

.file-icon {
  font-size: 32px;
}

.grid .file-icon {
  font-size: 48px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: var(--gc-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid .file-name {
  width: 100%;
}

.file-size,
.file-date {
  font-size: 13px;
  color: var(--gc-text-secondary);
  white-space: nowrap;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .star-btn,
.star-btn.active {
  opacity: 1;
}

.grid .star-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--gc-bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  animation: modalSlideIn 0.2s ease-out;
}

.small-dialog {
  max-width: 360px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--gc-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--gc-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--gc-text-secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0;
  color: var(--gc-text-secondary);
  line-height: 1.5;
}

.dialog-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 15px;
}

.dialog-input:focus {
  outline: none;
  border-color: var(--gc-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--gc-border);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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

.btn-ghost {
  background: transparent;
  color: var(--gc-text-primary);
  border: 1px solid var(--gc-border);
}

.btn-ghost:hover {
  background: var(--gc-bg-tertiary);
}

.btn-danger {
  background: var(--gc-error);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.hidden {
  display: none;
}

/* Activity Dialog */
.activity-dialog {
  max-width: 500px;
  max-height: 70vh;
}

.activity-body {
  max-height: 400px;
  overflow-y: auto;
}

.empty-activity {
  text-align: center;
  color: var(--gc-text-secondary);
  padding: 40px 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px;
  background: var(--gc-bg-secondary);
  border-radius: 8px;
}

.activity-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-action {
  display: block;
  font-size: 14px;
  color: var(--gc-text-primary);
}

.activity-time {
  display: block;
  font-size: 12px;
  color: var(--gc-text-secondary);
  margin-top: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 16px;
  }
  
  .section-header h2 {
    font-size: 20px;
  }
  
  .file-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .list .file-size,
  .list .file-date {
    display: none;
  }
}
</style>
