<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-content move-dialog">
        <div class="modal-header">
          <h3>Move "{{ itemName }}"</h3>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>

        <div class="modal-body">
          <!-- Breadcrumb navigation -->
          <div class="breadcrumb">
            <button 
              class="breadcrumb-item" 
              :class="{ active: selectedFolder === null }"
              @click="navigateToFolder(null)"
            >
              🏠 My Drive
            </button>
            <template v-for="(folder, index) in currentPath" :key="folder.id">
              <span class="breadcrumb-sep">/</span>
              <button 
                class="breadcrumb-item"
                :class="{ active: selectedFolder === folder.id }"
                @click="navigateToFolder(folder.id)"
              >
                {{ folder.name }}
              </button>
            </template>
          </div>

          <!-- Folder list -->
          <div class="folder-list">
            <div v-if="loading" class="loading">Loading...</div>
            
            <div v-else-if="availableFolders.length === 0" class="empty">
              No folders here
            </div>

            <template v-else>
              <button 
                v-for="folder in availableFolders" 
                :key="folder.id"
                class="folder-item"
                :class="{ selected: selectedFolder === folder.id }"
                @click="selectFolder(folder.id)"
                @dblclick="navigateToFolder(folder.id)"
              >
                <span class="folder-icon">📁</span>
                <span class="folder-name">{{ folder.name }}</span>
              </button>
            </template>
          </div>

          <!-- New folder button -->
          <div class="new-folder-section">
            <template v-if="creatingFolder">
              <input 
                ref="newFolderInput"
                v-model="newFolderName"
                type="text"
                placeholder="Folder name"
                class="new-folder-input"
                @keyup.enter="createNewFolder"
                @keyup.escape="cancelNewFolder"
              />
              <button class="btn btn-small" @click="createNewFolder">Create</button>
              <button class="btn btn-small btn-ghost" @click="cancelNewFolder">Cancel</button>
            </template>
            <button v-else class="btn btn-ghost" @click="startCreatingFolder">
              + New folder
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="emit('close')">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="confirmMove"
            :disabled="moving || selectedFolder === currentFolderId"
          >
            {{ moving ? 'Moving...' : 'Move here' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import apiClient from '~/utils/apiClient'
import { useFiles } from '~/composables/useFiles'

interface FolderItem {
  id: number
  name: string
  parent_id?: number
}

interface PathItem {
  id: number
  name: string
}

const props = defineProps<{
  visible: boolean
  itemName: string
  itemId: number
  itemType: 'file' | 'folder'
  currentFolderId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'move', folderId: number | null): void
}>()

const { createFolder } = useFiles()

const loading = ref(false)
const moving = ref(false)
const availableFolders = ref<FolderItem[]>([])
const currentPath = ref<PathItem[]>([])
const selectedFolder = ref<number | null>(null)
const browsingFolder = ref<number | null>(null)

// New folder state
const creatingFolder = ref(false)
const newFolderName = ref('')
const newFolderInput = ref<HTMLInputElement | null>(null)

// Exclude current item from folder list if it's a folder
const filteredFolders = computed(() => {
  if (props.itemType === 'folder') {
    return availableFolders.value.filter(f => f.id !== props.itemId)
  }
  return availableFolders.value
})

// Load folders when dialog opens or navigation changes
watch(() => [props.visible, browsingFolder.value], async () => {
  if (!props.visible) return
  await loadFolders(browsingFolder.value)
}, { immediate: true })

// Reset state when dialog opens
watch(() => props.visible, (visible) => {
  if (visible) {
    browsingFolder.value = props.currentFolderId
    selectedFolder.value = props.currentFolderId
    creatingFolder.value = false
    newFolderName.value = ''
  }
})

async function loadFolders(folderId: number | null) {
  loading.value = true
  try {
    const params = folderId ? { folder_id: folderId } : {}
    const res = await apiClient.get('/files', { params })
    availableFolders.value = res.data.folders || []
    currentPath.value = res.data.path || []
  } catch (err) {
    console.error('Load folders error:', err)
  } finally {
    loading.value = false
  }
}

function selectFolder(folderId: number) {
  selectedFolder.value = folderId
}

function navigateToFolder(folderId: number | null) {
  browsingFolder.value = folderId
  selectedFolder.value = folderId
}

function startCreatingFolder() {
  creatingFolder.value = true
  newFolderName.value = ''
  nextTick(() => {
    newFolderInput.value?.focus()
  })
}

function cancelNewFolder() {
  creatingFolder.value = false
  newFolderName.value = ''
}

async function createNewFolder() {
  if (!newFolderName.value.trim()) return
  
  const folderId = await createFolder(newFolderName.value, browsingFolder.value)
  if (folderId) {
    await loadFolders(browsingFolder.value)
    selectedFolder.value = folderId
    cancelNewFolder()
  }
}

async function confirmMove() {
  moving.value = true
  emit('move', selectedFolder.value)
  moving.value = false
}
</script>

<style scoped>
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
  max-width: 450px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.2s ease-out;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  padding: 16px 20px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
  overflow-x: auto;
  flex-shrink: 0;
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

.breadcrumb-item.active {
  color: var(--gc-primary);
  font-weight: 500;
}

.breadcrumb-sep {
  color: var(--gc-text-secondary);
}

.folder-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  min-height: 200px;
}

.loading,
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gc-text-secondary);
  font-size: 14px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  color: var(--gc-text-primary);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s;
}

.folder-item:hover {
  background: var(--gc-bg-tertiary);
}

.folder-item.selected {
  background: rgba(99, 102, 241, 0.1);
}

.folder-icon {
  font-size: 18px;
}

.folder-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.new-folder-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-shrink: 0;
}

.new-folder-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--gc-border);
  border-radius: 6px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 14px;
}

.new-folder-input:focus {
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

.btn-small {
  padding: 6px 12px;
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
</style>
