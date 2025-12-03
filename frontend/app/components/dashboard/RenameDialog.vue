<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-content rename-dialog">
        <div class="modal-header">
          <h3>Rename {{ type }}</h3>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>

        <div class="modal-body">
          <input 
            ref="inputRef"
            v-model="newName"
            type="text"
            :placeholder="`Enter new ${type} name`"
            class="rename-input"
            @keyup.enter="confirm"
            @keyup.escape="emit('close')"
          />
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="emit('close')">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="confirm"
            :disabled="!newName.trim() || newName === currentName"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  visible: boolean
  currentName: string
  type: 'file' | 'folder'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'rename', newName: string): void
}>()

const newName = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

// Reset and focus when dialog opens
watch(() => props.visible, (visible) => {
  if (visible) {
    newName.value = props.currentName
    nextTick(() => {
      inputRef.value?.focus()
      // Select filename without extension for files
      if (props.type === 'file' && inputRef.value) {
        const lastDot = props.currentName.lastIndexOf('.')
        if (lastDot > 0) {
          inputRef.value.setSelectionRange(0, lastDot)
        } else {
          inputRef.value.select()
        }
      } else {
        inputRef.value?.select()
      }
    })
  }
})

function confirm() {
  if (newName.value.trim() && newName.value !== props.currentName) {
    emit('rename', newName.value.trim())
  }
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
  max-width: 400px;
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

.rename-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  font-size: 15px;
}

.rename-input:focus {
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
</style>
