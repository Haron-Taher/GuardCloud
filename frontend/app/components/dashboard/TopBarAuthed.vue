<template>
  <header class="top">
    <div class="top__inner">
      <NuxtLink class="brand" to="/app">
        <img :src="logo" width="24" height="24" alt="GuardCloud" />
        <span>GuardCloud</span>
      </NuxtLink>

      <div class="search">
        <input
          :value="model"
          @input="$emit('search', ($event.target as HTMLInputElement).value)"
          type="search"
          placeholder="Search files, folders, people"
        />
      </div>

      <div class="actions">
        <button class="btn btn--ghost" @click="$emit('new')">New</button>
        <button class="btn btn--primary" @click="$emit('upload')">Upload</button>

        <button class="avatar" aria-label="Account">
          <span>HT</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import logo from '~/assets/logos/securecloud.png'

const props = defineProps<{ query?: string }>()
const emit = defineEmits<{ (e:'search', v:string):void, (e:'new'):void, (e:'upload'):void }>()

const model = computed(() => props.query ?? '')
</script>

<style scoped>
.top
{
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: saturate(160%) blur(6px);
  border-bottom: 1px solid var(--border);
}

.top__inner
{
  max-width: 1200px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
}

.brand
{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

.search
{
  display: grid;
}

.search input
{
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  outline: none;
}

.search input:focus
{
  border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}

.actions
{
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.avatar
{
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  display: grid;
  place-items: center;
  font-weight: 700;
}
</style>
