<template>
  <Teleport to="body">
    <div v-if="visible" class="preview-backdrop" @click.self="emit('close')">
      <div class="preview-container">
        <!-- Header -->
        <div class="preview-header">
          <div class="preview-title">
            <span class="preview-icon">{{ getFileEmoji(file?.filename || '', false) }}</span>
            <span class="preview-name">{{ file?.filename }}</span>
          </div>
          <div class="preview-actions">
            <button class="action-btn" @click="emit('download')" title="Download">
              ⬇️
            </button>
            <button class="action-btn" @click="emit('share')" title="Share">
              🔗
            </button>
            <button class="close-btn" @click="emit('close')">×</button>
          </div>
        </div>

        <!-- Content -->
        <div class="preview-content">
          <div v-if="loading" class="preview-loading">
            <div class="spinner"></div>
            <span>Loading preview...</span>
          </div>

          <div v-else-if="error" class="preview-error">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>

          <template v-else>
            <!-- Image preview -->
            <img 
              v-if="previewType === 'image'" 
              :src="previewUrl" 
              :alt="file?.filename"
              class="preview-image"
            />

            <!-- PDF preview -->
            <iframe 
              v-else-if="previewType === 'pdf'"
              :src="previewUrl"
              class="preview-pdf"
            ></iframe>

            <!-- Text preview -->
            <div v-else-if="previewType === 'text'" class="preview-text">
              <pre><code>{{ previewContent }}</code></pre>
            </div>

            <!-- No preview available -->
            <div v-else class="preview-unavailable">
              <span class="preview-icon-large">{{ getFileEmoji(file?.filename || '', false) }}</span>
              <h3>Preview not available</h3>
              <p>{{ file?.filename }}</p>
              <p class="file-size">{{ formatFileSize(file?.size || 0) }}</p>
              <button class="btn btn-primary" @click="emit('download')">
                Download file
              </button>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="preview-footer">
          <span class="file-info">
            {{ formatFileSize(file?.size || 0) }}
            <span v-if="file?.mime_type"> • {{ file.mime_type }}</span>
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useFiles } from '~/composables/useFiles'
import { getFileEmoji, formatFileSize } from '~/utils/fileIcons'

interface FileItem {
  id: number
  filename: string
  size: number
  mime_type?: string
}

const props = defineProps<{
  visible: boolean
  file: FileItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'download'): void
  (e: 'share'): void
}>()

const { preview } = useFiles()

const loading = ref(false)
const error = ref<string | null>(null)
const previewType = ref<'image' | 'pdf' | 'text' | 'none'>('none')
const previewUrl = ref<string | null>(null)
const previewContent = ref<string | null>(null)

// Load preview when file changes
watch(() => [props.visible, props.file], async () => {
  if (!props.visible || !props.file) {
    cleanup()
    return
  }

  loading.value = true
  error.value = null
  previewType.value = 'none'

  try {
    const result = await preview(props.file)
    
    if (!result) {
      previewType.value = 'none'
      return
    }

    if (result.url) {
      previewUrl.value = result.url
      if (result.mime_type?.startsWith('image/')) {
        previewType.value = 'image'
      } else if (result.mime_type === 'application/pdf') {
        previewType.value = 'pdf'
      }
    } else if (result.content !== undefined) {
      previewContent.value = result.content
      previewType.value = 'text'
    }
  } catch (err: any) {
    error.value = 'Could not load preview'
  } finally {
    loading.value = false
  }
}, { immediate: true })

function cleanup() {
  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  previewContent.value = null
  previewType.value = 'none'
  error.value = null
}

onUnmounted(cleanup)

// Handle escape key
watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleKeyDown)
  } else {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}
</script>

<style scoped>
.preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.preview-container {
  background: var(--gc-bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 1000px;
  height: 90vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: previewSlideIn 0.2s ease-out;
}

@keyframes previewSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gc-border);
  flex-shrink: 0;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.preview-icon {
  font-size: 20px;
}

.preview-name {
  font-weight: 500;
  color: var(--gc-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: var(--gc-bg-tertiary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--gc-text-secondary);
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
}

.close-btn:hover {
  color: var(--gc-text-primary);
}

.preview-content {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gc-bg-secondary);
}

.preview-loading,
.preview-error {
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

.error-icon {
  font-size: 32px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-pdf {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-text {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 20px;
}

.preview-text pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--gc-text-primary);
}

.preview-unavailable {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 40px;
}

.preview-icon-large {
  font-size: 64px;
}

.preview-unavailable h3 {
  margin: 0;
  color: var(--gc-text-primary);
}

.preview-unavailable p {
  margin: 0;
  color: var(--gc-text-secondary);
}

.file-size {
  font-size: 14px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
}

.btn-primary {
  background: var(--gc-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--gc-primary-hover);
}

.preview-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--gc-border);
  flex-shrink: 0;
}

.file-info {
  font-size: 13px;
  color: var(--gc-text-secondary);
}
</style>
