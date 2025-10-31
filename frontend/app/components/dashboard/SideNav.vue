<template>
  <aside class="side">
    <nav class="menu" role="navigation">
      <button
        v-for="item in items"
        :key="item.key"
        class="row"
        :class="{ active: section === item.key }"
        @click="$emit('navigate', item.key)"
      >
        <img :src="logo" alt="" width="18" height="18" />
        <span class="label">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup>
import logo from '~/assets/logos/securecloud.png'

defineProps(
{
  section: { type: String, required: true }
})

const items =
[
  { key: 'drive',   label: 'My Drive' },
  { key: 'shared',  label: 'Shared with me' },
  { key: 'recent',  label: 'Recent' },
  { key: 'starred', label: 'Starred' },
  { key: 'trash',   label: 'Trash' }
]
</script>

<style scoped>
.side
{
  border-right: 1px solid var(--border);
  min-height: calc(100vh - 60px);
  background: color-mix(in srgb, var(--card) 60%, transparent);
}

.menu
{
  display: grid;
  padding: 10px;
  gap: 6px;
}

.row
{
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 10px;
  align-items: center;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.row:hover
{
  background: color-mix(in srgb, var(--card) 80%, transparent);
}

.row.active
{
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}

.label
{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 920px)
{
  .label
  {
    display: none;
  }
}
</style>
