<template>
  <div class="page">
    <TopBarAuthed
      :query="query"
      @search="q => query = q"
      @new="onNew"
      @upload="onUpload"
    />

    <div class="layout">
      <SideNav
        :section="section"
        @navigate="s => section = s"
      />

      <FilesArea
        :section="section"
        :query="query"
        @open="onOpen"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TopBarAuthed from './TopBarAuthed.vue'
import SideNav from './SideNav.vue'
import FilesArea from './FilesArea.vue'

const section = ref('drive')
const query = ref('')

const onNew = () =>
{
  alert('New folder created')
}

const onUpload = () =>
{
  alert('Uploading...')
}

const onOpen = (item) =>
{
  alert(`Open ${item.name}`)
}
</script>

<style scoped>
.page
{
  --bg: #ffffff;
  --text: #0b1220;
  --muted: #5b6b7a;
  --card: #f5f7fb;
  --border: #e6e9ef;
  --accent: #0b57d0;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

@media (prefers-color-scheme: dark)
{
  .page
  {
    --bg: #0b0d11;
    --text: #e7ebf3;
    --muted: #9aa3af;
    --card: #121720;
    --border: #1e2532;
    --accent: #8ab4ff;
  }
}

.layout
{
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 0;
}

@media (max-width: 920px)
{
  .layout
  {
    grid-template-columns: 68px 1fr;
  }
}

.btn
{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  font-weight: 600;
  text-decoration: none;
  transition: transform .06s ease, background .2s ease, border-color .2s ease;
}

.btn:active
{
  transform: translateY(1px);
}

.btn--primary
{
  background: var(--accent);
  color: #fff;
  border-color: color-mix(in srgb, var(--accent) 70%, black 10%);
}

.btn--ghost
{
  background: transparent;
  color: var(--text);
}
</style>
