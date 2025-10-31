<template>
  <header class="topbar">
    <div class="container topbar__inner">
      <NuxtLink class="brand" to="/">
        <img :src="logo" width="24" height="24" alt="GuardCloud logo" />
        <span>GuardCloud</span>
      </NuxtLink>

      <nav class="links">
        <NuxtLink to="/">Home</NuxtLink>
        <a href="/#features">Features</a>
        <a href="/#security">Security</a>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>

      <div class="actions">
        <NuxtLink class="btn btn--ghost" to="/login">Sign in</NuxtLink>
        <NuxtLink class="btn btn--primary" to="/signup">Get started</NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import logo from '~/assets/logos/securecloud.png'
</script>

<style scoped>
.topbar
{
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.topbar__inner
{
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.brand
{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  text-decoration: none;
  color: inherit;
}

.links
{
  display: none;
  gap: 18px;
  align-items: center;
}

.links a,
.links :deep(a)
{
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
}

.links a:hover,
.links :deep(a:hover)
{
  color: var(--text);
}

.actions
{
  display: none;
  gap: 10px;
}

@media (min-width: 880px)
{
  .links
  {
    display: inline-flex;
  }

  .actions
  {
    display: inline-flex;
  }
}
</style>
