<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-content share-dialog">
        <div class="modal-header">
          <h3>Share "{{ file?.filename }}"</h3>
          <button class="close-btn" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Encryption Notice -->
          <div class="encryption-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div class="notice-content">
              <strong>End-to-end encrypted</strong>
              <span>Shared links allow direct downloads. Recipients won't need your encryption key.</span>
            </div>
          </div>

          <!-- Create new link section -->
          <div class="section">
            <h4>Create share link</h4>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="usePassword" />
                <span>Password protect</span>
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
                <span>Set expiration</span>
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
                <span>Limit downloads</span>
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
              <svg v-if="!creating" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
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
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                  </div>
                  <div class="link-meta">
                    <span v-if="link.has_password" class="meta-tag">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Protected
                    </span>
                    <span v-if="link.expires_at" class="meta-tag">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {{ formatExpiry(link.expires_at) }}
                    </span>
                    <span class="meta-tag">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                      </svg>
                      {{ link.download_count }}{{ link.max_downloads ? `/${link.max_downloads}` : '' }}
                    </span>
                  </div>
                </div>
                <button class="delete-btn" @click="removeLink(link.id)" title="Delete link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <Transition name="toast">
            <div v-if="copiedMessage" class="copied-toast">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {{ copiedMessage }}
            </div>
          </Transition>
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
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.2s ease-out;
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.3);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  overflow-y: auto;
}

/* Encryption Notice */
.encryption-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 10px;
  margin-bottom: 20px;
}

.encryption-notice svg {
  width: 22px;
  height: 22px;
  color: #10b981;
  flex-shrink: 0;
  margin-top: 1px;
}

.notice-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notice-content strong {
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
}

.notice-content span {
  font-size: 12px;
  color: var(--gc-text-secondary);
  line-height: 1.4;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section h4 {
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gc-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group {
  margin-bottom: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--gc-text-primary);
  font-size: 14px;
  margin-bottom: 8px;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--gc-primary);
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
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

.links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: var(--gc-bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--gc-border);
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-url {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.link-url code {
  flex: 1;
  padding: 8px 12px;
  background: var(--gc-bg-tertiary);
  border-radius: 6px;
  font-size: 12px;
  color: var(--gc-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: var(--gc-text-secondary);
  transition: all 0.15s;
}

.copy-btn svg {
  width: 16px;
  height: 16px;
}

.copy-btn:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-primary);
}

.link-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--gc-text-secondary);
  background: var(--gc-bg-tertiary);
  padding: 4px 10px;
  border-radius: 6px;
}

.meta-tag svg {
  width: 12px;
  height: 12px;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: var(--gc-text-secondary);
  transition: all 0.15s;
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--gc-error);
}

.copied-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gc-success);
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.copied-toast svg {
  width: 18px;
  height: 18px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
