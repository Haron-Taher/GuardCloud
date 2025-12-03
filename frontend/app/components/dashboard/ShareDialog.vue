<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-content share-dialog">
        <div class="modal-header">
          <h3>Share "{{ file?.filename }}"</h3>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>

        <div class="modal-body">
          <!-- Create new link section -->
          <div class="section">
            <h4>Create share link</h4>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="usePassword" />
                Password protect
              </label>
              <input 
                v-if="usePassword"
                v-model="password"
                type="password"
                placeholder="Enter password"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="useExpiry" />
                Set expiration
              </label>
              <select v-if="useExpiry" v-model="expiryDays" class="form-input">
                <option :value="1">1 day</option>
                <option :value="7">7 days</option>
                <option :value="30">30 days</option>
                <option :value="90">90 days</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="useMaxDownloads" />
                Limit downloads
              </label>
              <input 
                v-if="useMaxDownloads"
                v-model.number="maxDownloads"
                type="number"
                min="1"
                placeholder="Max downloads"
                class="form-input"
              />
            </div>

            <button 
              class="btn btn-primary" 
              @click="createLink"
              :disabled="creating"
            >
              {{ creating ? 'Creating...' : 'Create link' }}
            </button>
          </div>

          <!-- Existing links section -->
          <div v-if="links.length > 0" class="section">
            <h4>Existing links</h4>
            
            <div class="links-list">
              <div v-for="link in links" :key="link.id" class="link-item">
                <div class="link-info">
                  <div class="link-url">
                    <code>{{ getShareUrl(link.token) }}</code>
                    <button class="copy-btn" @click="copyLink(link.token)" title="Copy link">
                      📋
                    </button>
                  </div>
                  <div class="link-meta">
                    <span v-if="link.has_password" class="meta-tag">🔒 Protected</span>
                    <span v-if="link.expires_at" class="meta-tag">⏰ {{ formatExpiry(link.expires_at) }}</span>
                    <span v-if="link.max_downloads" class="meta-tag">
                      📥 {{ link.download_count }}/{{ link.max_downloads }}
                    </span>
                    <span v-else class="meta-tag">📥 {{ link.download_count }} downloads</span>
                  </div>
                </div>
                <button class="delete-btn" @click="removeLink(link.id)" title="Delete link">
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <div v-if="copiedMessage" class="copied-toast">
            {{ copiedMessage }}
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFiles } from '~/composables/useFiles'

interface FileItem {
  id: number
  filename: string
}

interface ShareLink {
  id: number
  token: string
  has_password: boolean
  expires_at?: string
  max_downloads?: number
  download_count: number
}

const props = defineProps<{
  visible: boolean
  file: FileItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { createShareLink, getShareLinks, deleteShareLink } = useFiles()

const links = ref<ShareLink[]>([])
const creating = ref(false)

// Form state
const usePassword = ref(false)
const password = ref('')
const useExpiry = ref(false)
const expiryDays = ref(7)
const useMaxDownloads = ref(false)
const maxDownloads = ref(10)

const copiedMessage = ref('')

// Load links when file changes
watch(() => [props.visible, props.file], async () => {
  if (props.visible && props.file) {
    links.value = await getShareLinks(props.file.id)
  }
}, { immediate: true })

function getShareUrl(token: string) {
  const baseUrl = window.location.origin
  return `${baseUrl}/share/${token}`
}

async function createLink() {
  if (!props.file) return
  
  creating.value = true
  
  const options: any = {}
  if (usePassword.value && password.value) {
    options.password = password.value
  }
  if (useExpiry.value) {
    options.expires_in_days = expiryDays.value
  }
  if (useMaxDownloads.value && maxDownloads.value > 0) {
    options.max_downloads = maxDownloads.value
  }

  const result = await createShareLink(props.file.id, options)
  
  if (result) {
    links.value = await getShareLinks(props.file.id)
    // Reset form
    usePassword.value = false
    password.value = ''
    useExpiry.value = false
    useMaxDownloads.value = false
    
    // Auto-copy new link
    copyLink(result.token)
  }
  
  creating.value = false
}

async function removeLink(linkId: number) {
  if (confirm('Delete this share link?')) {
    const success = await deleteShareLink(linkId)
    if (success) {
      links.value = links.value.filter(l => l.id !== linkId)
    }
  }
}

function copyLink(token: string) {
  const url = getShareUrl(token)
  navigator.clipboard.writeText(url)
  copiedMessage.value = 'Link copied!'
  setTimeout(() => {
    copiedMessage.value = ''
  }, 2000)
}

function formatExpiry(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  
  if (diff < 0) return 'Expired'
  
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 1) return '1 day left'
  return `${days} days left`
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
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
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

.close-btn:hover {
  color: var(--gc-text-primary);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--gc-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group {
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--gc-text-primary);
  font-size: 14px;
  margin-bottom: 8px;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 14px;
  margin-top: 4px;
}

.form-input:focus {
  outline: none;
  border-color: var(--gc-primary);
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

.links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--gc-bg-secondary);
  border-radius: 8px;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-url {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.link-url code {
  flex: 1;
  padding: 6px 10px;
  background: var(--gc-bg-tertiary);
  border-radius: 4px;
  font-size: 12px;
  color: var(--gc-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background: var(--gc-bg-tertiary);
}

.link-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-tag {
  font-size: 12px;
  color: var(--gc-text-secondary);
  background: var(--gc-bg-tertiary);
  padding: 2px 8px;
  border-radius: 4px;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s;
}

.delete-btn:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
}

.copied-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gc-success);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  animation: toastFadeIn 0.2s ease-out;
}

@keyframes toastFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
