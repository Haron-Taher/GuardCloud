<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="context-menu"
      :style="{ top: `${y}px`, left: `${x}px` }"
      @click.stop
    >
      <div class="context-menu-content">
        <!-- File actions -->
        <template v-if="type === 'file'">
          <button class="context-item" @click="emit('action', 'open')">
            <span class="context-icon">📂</span>
            Open
          </button>
          <button class="context-item" @click="emit('action', 'download')">
            <span class="context-icon">⬇️</span>
            Download
          </button>
          <button class="context-item" @click="emit('action', 'preview')">
            <span class="context-icon">👁️</span>
            Preview
          </button>
          <div class="context-divider"></div>
          <button class="context-item" @click="emit('action', 'share')">
            <span class="context-icon">🔗</span>
            Share
          </button>
          <button class="context-item" @click="emit('action', 'move')">
            <span class="context-icon">📁</span>
            Move to...
          </button>
          <div class="context-divider"></div>
          <button class="context-item" @click="emit('action', 'rename')">
            <span class="context-icon">✏️</span>
            Rename
          </button>
          <button class="context-item" @click="emit('action', 'star')">
            <span class="context-icon">{{ starred ? '⭐' : '☆' }}</span>
            {{ starred ? 'Remove star' : 'Add star' }}
          </button>
          <div class="context-divider"></div>
          <button class="context-item context-item-danger" @click="emit('action', 'trash')">
            <span class="context-icon">🗑️</span>
            Move to trash
          </button>
        </template>

        <!-- Folder actions -->
        <template v-else-if="type === 'folder'">
          <button class="context-item" @click="emit('action', 'open')">
            <span class="context-icon">📂</span>
            Open
          </button>
          <div class="context-divider"></div>
          <button class="context-item" @click="emit('action', 'rename')">
            <span class="context-icon">✏️</span>
            Rename
          </button>
          <div class="context-divider"></div>
          <button class="context-item context-item-danger" @click="emit('action', 'delete')">
            <span class="context-icon">🗑️</span>
            Delete folder
          </button>
        </template>

        <!-- Trash item actions -->
        <template v-else-if="type === 'trash'">
          <button class="context-item" @click="emit('action', 'restore')">
            <span class="context-icon">♻️</span>
            Restore
          </button>
          <div class="context-divider"></div>
          <button class="context-item context-item-danger" @click="emit('action', 'delete-permanent')">
            <span class="context-icon">🗑️</span>
            Delete permanently
          </button>
        </template>

        <!-- Background actions -->
        <template v-else>
          <button class="context-item" @click="emit('action', 'new-folder')">
            <span class="context-icon">📁</span>
            New folder
          </button>
          <button class="context-item" @click="emit('action', 'upload')">
            <span class="context-icon">⬆️</span>
            Upload files
          </button>
          <div class="context-divider"></div>
          <button class="context-item" @click="emit('action', 'refresh')">
            <span class="context-icon">🔄</span>
            Refresh
          </button>
        </template>
      </div>
    </div>
    
    <!-- Backdrop to catch clicks -->
    <div v-if="visible" class="context-backdrop" @click="emit('close')"></div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  x: number
  y: number
  type: 'file' | 'folder' | 'trash' | 'background'
  starred?: boolean
}>()

const emit = defineEmits<{
  (e: 'action', action: string): void
  (e: 'close'): void
}>()
</script>

<style scoped>
.context-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 180px;
  animation: contextFadeIn 0.1s ease-out;
}

@keyframes contextFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-menu-content {
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 6px;
  overflow: hidden;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  color: var(--gc-text-primary);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.15s;
}

.context-item:hover {
  background: var(--gc-bg-tertiary);
}

.context-item-danger {
  color: var(--gc-error);
}

.context-item-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.context-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.context-divider {
  height: 1px;
  background: var(--gc-border);
  margin: 6px 0;
}
</style>
