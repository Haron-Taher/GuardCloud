<template>
  <Teleport to="body">
    <!-- Backdrop to catch clicks -->
    <div v-if="visible" class="context-backdrop" @click="emit('close')"></div>
    
    <Transition name="context">
      <div 
        v-if="visible" 
        class="context-menu"
        :style="{ top: `${y}px`, left: `${x}px` }"
        @click.stop
      >
        <!-- File actions -->
        <template v-if="type === 'file'">
          <button class="context-item" @click="emit('action', 'open')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M5 19a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1 M3 17l3.5-9H21l-3.5 9H3z"/>
            </svg>
            Open
          </button>
          <button class="context-item" @click="emit('action', 'download')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Download
          </button>
          <button class="context-item" @click="emit('action', 'preview')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </button>
          <div class="context-divider"></div>
          <button class="context-item" @click="emit('action', 'share')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
            Share
          </button>
          <button class="context-item" @click="emit('action', 'move')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <path d="M12 11v6M9 14l3-3 3 3"/>
            </svg>
            Move to...
          </button>
          <div class="context-divider"></div>
          <button class="context-item" @click="emit('action', 'rename')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Rename
          </button>
          <button class="context-item" @click="emit('action', 'star')">
            <svg viewBox="0 0 24 24" :fill="starred ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {{ starred ? 'Remove star' : 'Add star' }}
          </button>
          <div class="context-divider"></div>
          <button class="context-item context-item-danger" @click="emit('action', 'trash')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Move to trash
          </button>
        </template>

        <!-- Folder actions -->
        <template v-else-if="type === 'folder'">
          <button class="context-item" @click="emit('action', 'open')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M5 19a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1 M3 17l3.5-9H21l-3.5 9H3z"/>
            </svg>
            Open folder
          </button>
          <div class="context-divider"></div>
          <button class="context-item" @click="emit('action', 'rename')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Rename
          </button>
          <div class="context-divider"></div>
          <button class="context-item context-item-danger" @click="emit('action', 'delete')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete folder
          </button>
        </template>

        <!-- Trash item actions -->
        <template v-else-if="type === 'trash'">
          <button class="context-item" @click="emit('action', 'restore')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Restore
          </button>
          <div class="context-divider"></div>
          <button class="context-item context-item-danger" @click="emit('action', 'delete-permanent')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
            </svg>
            Delete permanently
          </button>
        </template>

        <!-- Background actions -->
        <template v-else>
          <button class="context-item" @click="emit('action', 'new-folder')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <path d="M12 11v6M9 14h6"/>
            </svg>
            New folder
          </button>
          <button class="context-item" @click="emit('action', 'upload')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Upload files
          </button>
          <div class="context-divider"></div>
          <button class="context-item" @click="emit('action', 'refresh')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </template>
      </div>
    </Transition>
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
  z-index: 998;
}

.context-menu {
  position: fixed;
  z-index: 999;
  min-width: 200px;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.25);
  padding: 6px;
  overflow: hidden;
}

/* Context menu animation */
.context-enter-active,
.context-leave-active {
  transition: all 0.15s ease;
}

.context-enter-from,
.context-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.context-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  color: var(--gc-text-primary);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.context-item svg {
  width: 18px;
  height: 18px;
  color: var(--gc-text-secondary);
  flex-shrink: 0;
}

.context-item:hover {
  background: var(--gc-bg-tertiary);
}

.context-item:hover svg {
  color: var(--gc-text-primary);
}

.context-item-danger {
  color: var(--gc-error);
}

.context-item-danger svg {
  color: var(--gc-error);
}

.context-item-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.context-divider {
  height: 1px;
  background: var(--gc-border);
  margin: 6px 0;
}
</style>
