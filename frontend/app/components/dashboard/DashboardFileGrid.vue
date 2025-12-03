<script setup lang="ts">
import { computed } from 'vue'

export interface FileItem {
  id: string | number
  name: string
  type: string
  size: number
  modified: number
  owner: string
  starred: boolean
}

interface Props {
  files: FileItem[]
  viewMode: 'grid' | 'list'
  selectedId?: string | number | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid',
  selectedId: null,
  loading: false,
})

const emit = defineEmits<{
  (e: 'select', file: FileItem): void
  (e: 'open', file: FileItem): void
  (e: 'star', file: FileItem): void
  (e: 'delete', file: FileItem): void
}>()

const getFileIcon = (file: FileItem): string => {
  if (!file.name) return '📄'
  
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📽️',
    pptx: '📽️',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    webp: '🖼️',
    mp3: '🎵',
    wav: '🎵',
    mp4: '🎬',
    avi: '🎬',
    mkv: '🎬',
    zip: '📦',
    rar: '📦',
    '7z': '📦',
    txt: '📃',
    md: '📃',
    json: '📋',
    js: '💻',
    ts: '💻',
    jsx: '💻',
    tsx: '💻',
    vue: '💚',
    html: '🌐',
    css: '🎨',
    py: '🐍',
    folder: '📁',
  }
  
  if (file.type === 'folder') return '📁'
  return iconMap[ext] || '📄'
}

const formatSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '—'
  
  const kb = 1024
  const mb = kb * 1024
  const gb = mb * 1024
  
  if (bytes >= gb) return `${(bytes / gb).toFixed(1)} GB`
  if (bytes >= mb) return `${(bytes / mb).toFixed(1)} MB`
  if (bytes >= kb) return `${Math.round(bytes / kb)} KB`
  return `${bytes} B`
}

const formatDate = (timestamp: number): string => {
  if (!timestamp) return '—'
  
  const date = new Date(timestamp)
  
  // Check for invalid date
  if (isNaN(date.getTime())) return '—'
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Negative diff means future date (clock skew)
  if (diff < 0) return 'Just now'
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

const handleRightClick = (event: MouseEvent, file: FileItem) => {
  event.preventDefault()
  emit('select', file)
  // Could add context menu here in the future
}
</script>

<template>
  <div class="file-area">
    <!-- Loading state -->
    <div v-if="loading" class="file-area__loading">
      <div class="spinner"></div>
      <span>Loading files...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="!files.length" class="file-area__empty">
      <span class="empty-icon">📂</span>
      <h3>No files here</h3>
      <p>Upload files or drag and drop to get started.</p>
    </div>

    <!-- Grid view -->
    <div v-else-if="viewMode === 'grid'" class="file-grid">
      <button
        v-for="file in files"
        :key="file.id"
        class="file-tile"
        :class="{ 'file-tile--selected': file.id === selectedId }"
        @click="$emit('select', file)"
        @dblclick="$emit('open', file)"
        @contextmenu="handleRightClick($event, file)"
      >
        <div class="file-tile__thumb">
          <span class="file-tile__icon">{{ getFileIcon(file) }}</span>
        </div>
        <div class="file-tile__info">
          <span class="file-tile__name" :title="file.name">{{ file.name }}</span>
          <span class="file-tile__meta">{{ formatSize(file.size) }} • {{ formatDate(file.modified) }}</span>
        </div>
        <button 
          class="file-tile__star" 
          :class="{ 'file-tile__star--active': file.starred }"
          @click.stop="$emit('star', file)"
          :title="file.starred ? 'Remove from starred' : 'Add to starred'"
        >
          {{ file.starred ? '★' : '☆' }}
        </button>
      </button>
    </div>

    <!-- List view -->
    <table v-else class="file-list">
      <thead>
        <tr>
          <th class="file-list__th-name">Name</th>
          <th>Owner</th>
          <th>Modified</th>
          <th>Size</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="file in files"
          :key="file.id"
          :class="{ 'file-list__row--selected': file.id === selectedId }"
          @click="$emit('select', file)"
          @dblclick="$emit('open', file)"
          @contextmenu="handleRightClick($event, file)"
        >
          <td class="file-list__name">
            <span class="file-list__icon">{{ getFileIcon(file) }}</span>
            <span :title="file.name">{{ file.name }}</span>
          </td>
          <td>{{ file.owner }}</td>
          <td>{{ formatDate(file.modified) }}</td>
          <td>{{ formatSize(file.size) }}</td>
          <td class="file-list__actions">
            <button 
              class="file-list__star"
              :class="{ 'file-list__star--active': file.starred }"
              @click.stop="$emit('star', file)"
              :title="file.starred ? 'Remove from starred' : 'Add to starred'"
            >
              {{ file.starred ? '★' : '☆' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.file-area {
  flex: 1;
  min-height: 0;
}

/* Loading */
.file-area__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px;
  color: var(--gc-text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--gc-border);
  border-top-color: var(--gc-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty */
.file-area__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 24px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.file-area__empty h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--gc-text);
}

.file-area__empty p {
  font-size: 14px;
  color: var(--gc-text-muted);
  margin: 0;
}

/* Grid */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.file-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--gc-card);
  border: 1px solid var(--gc-border);
  border-radius: var(--gc-radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.file-tile:hover {
  transform: translateY(-2px);
  box-shadow: var(--gc-shadow-md);
}

.file-tile:focus {
  outline: none;
  border-color: var(--gc-accent);
  box-shadow: 0 0 0 2px var(--gc-accent-light);
}

.file-tile--selected {
  border-color: var(--gc-accent);
  box-shadow: 0 0 0 2px var(--gc-accent-light);
}

.file-tile__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  background: var(--gc-bg);
  border: 1px dashed var(--gc-border);
  border-radius: var(--gc-radius-md);
  margin-bottom: 12px;
}

.file-tile__icon {
  font-size: 40px;
}

.file-tile__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.file-tile__name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--gc-text);
}

.file-tile__meta {
  font-size: 12px;
  color: var(--gc-text-muted);
}

.file-tile__star {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--gc-text-muted);
  transition: all 0.15s;
  padding: 4px;
  border-radius: 4px;
}

.file-tile__star:hover {
  background: var(--gc-border);
  transform: scale(1.1);
}

.file-tile__star--active {
  color: #fbbf24;
}

/* List */
.file-list {
  width: 100%;
  border-collapse: collapse;
  background: var(--gc-card);
  border: 1px solid var(--gc-border);
  border-radius: var(--gc-radius-lg);
  overflow: hidden;
}

.file-list th,
.file-list td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--gc-border);
}

.file-list th {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gc-text-muted);
  background: var(--gc-bg);
}

.file-list__th-name {
  width: 40%;
}

.file-list tbody tr {
  cursor: pointer;
  transition: background 0.1s;
}

.file-list tbody tr:hover {
  background: color-mix(in srgb, var(--gc-accent-light) 50%, transparent);
}

.file-list tbody tr:last-child td {
  border-bottom: none;
}

.file-list__row--selected {
  background: var(--gc-accent-light) !important;
}

.file-list__name {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  min-width: 0;
}

.file-list__name span:last-child {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-list__icon {
  font-size: 20px;
  flex-shrink: 0;
}

.file-list__actions {
  width: 50px;
  text-align: center;
}

.file-list__star {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--gc-text-muted);
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}

.file-list__star:hover {
  background: var(--gc-border);
}

.file-list__star--active {
  color: #fbbf24;
}

/* Responsive */
@media (max-width: 768px) {
  .file-list th:nth-child(2),
  .file-list td:nth-child(2),
  .file-list th:nth-child(4),
  .file-list td:nth-child(4) {
    display: none;
  }
}
</style>
