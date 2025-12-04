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
        @newAction="showNewFolderDialog"
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            My Drive
          </button>
          <template v-for="(folder, index) in path" :key="folder.id">
            <svg class="breadcrumb-sep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button 
              class="view-btn" 
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
              title="List view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Upload Progress -->
        <Transition name="slide-down">
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
            <span class="progress-text">Uploading... {{ uploadProgress }}%</span>
          </div>
        </Transition>

        <!-- Error Banner -->
        <Transition name="slide-down">
          <div v-if="error" class="error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>{{ error }}</span>
            <button @click="clearError">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </Transition>

        <!-- Drag Drop Overlay -->
        <Transition name="fade">
          <div v-if="isDragging" class="drag-overlay">
            <div class="drag-content">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <span>Drop files to upload</span>
            </div>
          </div>
        </Transition>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Loading files...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="isEmpty" class="empty-state">
          <div class="empty-icon">
            <svg v-if="activeSection === 'drive'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <svg v-else-if="activeSection === 'starred'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
          <h3>{{ emptyTitle }}</h3>
          <p>{{ emptyMessage }}</p>
          <button 
            v-if="activeSection === 'drive'" 
            class="btn btn-primary"
            @click="triggerUpload"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
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
            <div class="file-icon folder-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span class="file-name">{{ folder.name }}</span>
            <span v-if="viewMode === 'list'" class="file-meta">Folder</span>
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
            <div class="file-icon" :class="getFileIconClass(file.filename)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path :d="getFileIconPath(file.filename)" />
              </svg>
            </div>
            <span class="file-name">{{ file.filename }}</span>
            <span v-if="viewMode === 'list'" class="file-meta">{{ formatSize(file.size) }}</span>
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
              <svg viewBox="0 0 24 24" :fill="starredIds.has(file.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
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
      <Transition name="modal">
        <div v-if="newFolderDialog.visible" class="modal-backdrop" @click.self="newFolderDialog.visible = false">
          <div class="modal-content small-dialog">
            <div class="modal-header">
              <h3>New folder</h3>
              <button class="close-btn" @click="newFolderDialog.visible = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
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
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteConfirm.visible" class="modal-backdrop" @click.self="deleteConfirm.visible = false">
          <div class="modal-content small-dialog">
            <div class="modal-header">
              <h3>{{ deleteConfirm.permanent ? 'Delete permanently?' : 'Move to trash?' }}</h3>
              <button class="close-btn" @click="deleteConfirm.visible = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
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
                {{ deleteConfirm.permanent ? 'Delete' : 'Move to trash' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Logout Confirmation -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showLogoutConfirm" class="modal-backdrop" @click.self="showLogoutConfirm = false">
          <div class="modal-content small-dialog">
            <div class="modal-header">
              <h3>Sign out?</h3>
              <button class="close-btn" @click="showLogoutConfirm = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
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
      </Transition>
    </Teleport>

    <!-- Activity Log Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="activityLog.visible" class="modal-backdrop" @click.self="activityLog.visible = false">
          <div class="modal-content activity-dialog">
            <div class="modal-header">
              <h3>Activity</h3>
              <button class="close-btn" @click="activityLog.visible = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="modal-body activity-body">
              <div v-if="activityLog.items.length === 0" class="empty-activity">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <span>No activity yet</span>
              </div>
              <div v-else class="activity-list">
                <div v-for="item in activityLog.items" :key="item.id" class="activity-item">
                  <div class="activity-icon" :class="getActivityClass(item.action)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path :d="getActivityIconPath(item.action)" />
                    </svg>
                  </div>
                  <div class="activity-content">
                    <span class="activity-action">{{ formatActivityAction(item) }}</span>
                    <span class="activity-time">{{ formatDate(item.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useFiles } from '~/composables/useFiles'
import { formatFileSize, formatFileDate } from '~/utils/fileIcons'
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
const { authState, logout, fetchProfile } = useAuth()
const { 
  files, folders, path, currentFolderId, loading, error, uploadProgress, storageStats,
  fetchFiles, fetchTrash, searchFiles, upload, download, trashFile, restoreFile, deleteFile,
  renameFile, moveFile, createFolder, renameFolder, deleteFolder, fetchStorageStats, clearError,
  getActivity
} = useFiles()

// User info - will be populated from fetchProfile
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

// File icon helpers
function getFileIconPath(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  const iconPaths: Record<string, string> = {
    // Images
    jpg: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    jpeg: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    png: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    gif: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    webp: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    svg: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    // Videos
    mp4: 'M23 7l-7 5 7 5V7z M14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
    mov: 'M23 7l-7 5 7 5V7z M14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
    webm: 'M23 7l-7 5 7 5V7z M14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
    // Audio
    mp3: 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    wav: 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    // Documents
    pdf: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    docx: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    txt: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    // Code
    js: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 13l-2 2 2 2 M14 13l2 2-2 2',
    ts: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 13l-2 2 2 2 M14 13l2 2-2 2',
    py: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 13l-2 2 2 2 M14 13l2 2-2 2',
    html: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 13l-2 2 2 2 M14 13l2 2-2 2',
    css: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 13l-2 2 2 2 M14 13l2 2-2 2',
    json: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 13l-2 2 2 2 M14 13l2 2-2 2',
    // Archives
    zip: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 12h1 M10 15h1 M10 18h1',
    rar: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 12h1 M10 15h1 M10 18h1',
  }
  
  return iconPaths[ext] || 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6'
}

function getFileIconClass(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp']
  const videoExts = ['mp4', 'webm', 'avi', 'mov', 'mkv']
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac']
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf']
  const codeExts = ['js', 'ts', 'jsx', 'tsx', 'vue', 'html', 'css', 'scss', 'json', 'py', 'java', 'c', 'cpp']
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz']
  
  if (imageExts.includes(ext)) return 'icon-image'
  if (videoExts.includes(ext)) return 'icon-video'
  if (audioExts.includes(ext)) return 'icon-audio'
  if (docExts.includes(ext)) return 'icon-document'
  if (codeExts.includes(ext)) return 'icon-code'
  if (archiveExts.includes(ext)) return 'icon-archive'
  return 'icon-default'
}

// Activity icon helpers
function getActivityIconPath(action: string): string {
  const paths: Record<string, string> = {
    upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    delete: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    restore: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5',
    rename: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    move: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
    share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
    create_folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2zM12 11v6M9 14h6',
    login: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
    signup: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM20 8v6M23 11h-6',
    update_profile: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    change_password: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  }
  return paths[action] || 'M22 12h-4l-3 9L9 3l-3 9H2'
}

function getActivityClass(action: string): string {
  if (['upload', 'create_folder', 'signup'].includes(action)) return 'activity-success'
  if (['delete', 'trash'].includes(action)) return 'activity-danger'
  if (['share'].includes(action)) return 'activity-primary'
  return 'activity-default'
}

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

  // Fetch user profile to get full user data
  try {
    await fetchProfile()
  } catch (e) {
    console.error('Failed to fetch profile:', e)
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
  e.stopPropagation()
  
  contextMenu.value = {
    visible: true,
    x: Math.min(e.clientX, window.innerWidth - 220),
    y: Math.min(e.clientY, window.innerHeight - 350),
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
    x: Math.min(e.clientX, window.innerWidth - 220),
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

// Activity log
const activityLog = ref<{ visible: boolean; items: any[] }>({
  visible: false,
  items: []
})

async function showActivityLog() {
  const items = await getActivity(50)
  activityLog.value = { visible: true, items }
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
  padding: 24px 32px;
  overflow-y: auto;
  position: relative;
  background: linear-gradient(180deg, var(--gc-bg-secondary) 0%, var(--gc-bg-primary) 100%);
  min-height: calc(100vh - 64px);
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding: 8px 12px;
  background: var(--gc-bg-primary);
  border-radius: 10px;
  border: 1px solid var(--gc-border);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--gc-text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  transition: all 0.15s;
}

.breadcrumb-item svg {
  width: 16px;
  height: 16px;
}

.breadcrumb-item:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

.breadcrumb-sep {
  width: 16px;
  height: 16px;
  color: var(--gc-text-secondary);
  opacity: 0.5;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.view-controls {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--gc-bg-primary);
  border-radius: 10px;
  border: 1px solid var(--gc-border);
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--gc-text-secondary);
  transition: all 0.15s;
}

.view-btn svg {
  width: 18px;
  height: 18px;
}

.view-btn:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

.view-btn.active {
  background: var(--gc-primary);
  color: white;
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(-10px);
}

/* Upload Progress */
.upload-progress {
  position: fixed;
  top: 64px;
  left: 240px;
  right: 0;
  height: 4px;
  background: var(--gc-bg-tertiary);
  z-index: 50;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--gc-primary) 0%, #8b5cf6 100%);
  transition: width 0.2s;
}

.progress-text {
  position: absolute;
  right: 20px;
  top: 8px;
  font-size: 12px;
  color: var(--gc-text-secondary);
  background: var(--gc-bg-primary);
  padding: 4px 10px;
  border-radius: 6px;
  box-shadow: var(--gc-shadow-sm);
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 20px;
  color: var(--gc-error);
}

.error-banner svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.error-banner span {
  flex: 1;
  font-size: 14px;
}

.error-banner button {
  background: none;
  border: none;
  color: var(--gc-error);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  transition: background-color 0.15s;
}

.error-banner button:hover {
  background: rgba(239, 68, 68, 0.1);
}

.error-banner button svg {
  width: 16px;
  height: 16px;
}

/* Drag Overlay */
.drag-overlay {
  position: absolute;
  inset: 16px;
  background: rgba(99, 102, 241, 0.05);
  border: 2px dashed var(--gc-primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
}

.drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--gc-primary);
  font-weight: 500;
  font-size: 16px;
}

.drag-content svg {
  width: 48px;
  height: 48px;
  opacity: 0.8;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  color: var(--gc-text-secondary);
}

.spinner {
  width: 36px;
  height: 36px;
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
  gap: 16px;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 20px;
  color: var(--gc-text-secondary);
}

.empty-icon svg {
  width: 40px;
  height: 40px;
}

.empty-state h3 {
  margin: 0;
  color: var(--gc-text-primary);
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  color: var(--gc-text-secondary);
  font-size: 15px;
}

/* File Container */
.file-container {
  display: grid;
  gap: 16px;
}

.file-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

.file-container.list {
  grid-template-columns: 1fr;
  gap: 8px;
}

/* File Item */
.file-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.file-item:hover {
  border-color: var(--gc-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.file-item.selected {
  border-color: var(--gc-primary);
  background: rgba(99, 102, 241, 0.05);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.grid .file-item {
  flex-direction: column;
  text-align: center;
  padding: 20px 16px;
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gc-bg-secondary);
  border-radius: 10px;
  color: var(--gc-text-secondary);
  flex-shrink: 0;
}

.file-icon svg {
  width: 22px;
  height: 22px;
}

.grid .file-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
}

.grid .file-icon svg {
  width: 28px;
  height: 28px;
}

/* File icon colors */
.folder-icon {
  background: rgba(251, 191, 36, 0.15);
  color: #f59e0b;
}

.icon-image {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.icon-video {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.icon-audio {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.icon-document {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.icon-code {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}

.icon-archive {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.file-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--gc-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid .file-name {
  width: 100%;
  font-size: 13px;
  margin-top: 4px;
}

.file-meta,
.file-date {
  font-size: 13px;
  color: var(--gc-text-secondary);
  white-space: nowrap;
}

.file-meta {
  min-width: 80px;
  text-align: right;
}

.file-date {
  min-width: 100px;
  text-align: right;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s;
  color: var(--gc-text-secondary);
}

.star-btn svg {
  width: 18px;
  height: 18px;
}

.file-item:hover .star-btn,
.star-btn.active {
  opacity: 1;
}

.star-btn.active {
  color: #f59e0b;
}

.star-btn:hover {
  background: var(--gc-bg-tertiary);
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
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--gc-bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.small-dialog {
  max-width: 380px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--gc-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--gc-text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--gc-text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.15s;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.close-btn:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

.modal-body {
  padding: 22px;
}

.modal-body p {
  margin: 0;
  color: var(--gc-text-secondary);
  line-height: 1.6;
  font-size: 15px;
}

.dialog-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 15px;
  transition: all 0.2s;
}

.dialog-input:focus {
  outline: none;
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 22px;
  border-top: 1px solid var(--gc-border);
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 22px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn-primary {
  background: var(--gc-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--gc-primary-hover);
  transform: translateY(-1px);
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
  max-width: 520px;
  max-height: 80vh;
}

.activity-body {
  max-height: 450px;
  overflow-y: auto;
  padding: 16px 22px;
}

.empty-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--gc-text-secondary);
  padding: 40px 20px;
}

.empty-activity svg {
  width: 40px;
  height: 40px;
  opacity: 0.5;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px;
  background: var(--gc-bg-secondary);
  border-radius: 10px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gc-bg-tertiary);
  border-radius: 8px;
  flex-shrink: 0;
}

.activity-icon svg {
  width: 18px;
  height: 18px;
}

.activity-icon.activity-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.activity-icon.activity-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.activity-icon.activity-primary {
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-action {
  display: block;
  font-size: 14px;
  color: var(--gc-text-primary);
  font-weight: 500;
}

.activity-time {
  display: block;
  font-size: 12px;
  color: var(--gc-text-secondary);
  margin-top: 3px;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 20px 16px;
  }
  
  .upload-progress {
    left: 0;
  }
  
  .section-header h2 {
    font-size: 22px;
  }
  
  .file-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
  
  .list .file-meta,
  .list .file-date {
    display: none;
  }
}
</style>
