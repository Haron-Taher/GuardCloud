<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import logo from '~/assets/logos/securecloud.png'

const scrolled = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="navbar" :class="{ 'navbar--scrolled': scrolled }">
    <div class="navbar__inner">
      <NuxtLink to="/" class="navbar__brand">
        <img :src="logo" width="32" height="32" alt="GuardCloud" />
        <span>GuardCloud</span>
      </NuxtLink>

      <nav class="navbar__links">
        <a href="#features">Features</a>
        <a href="#security">Security</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </nav>

      <div class="navbar__actions">
        <NuxtLink to="/login" class="navbar__login">Sign in</NuxtLink>
        <NuxtLink to="/signup" class="navbar__cta">Get started</NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 12px 0;
  transition: all 0.2s ease;
}

.navbar--scrolled {
  background: color-mix(in srgb, var(--gc-bg) 90%, transparent);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--gc-border);
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--gc-text);
  font-weight: 700;
  font-size: 18px;
}

.navbar__brand img {
  border-radius: 8px;
}

.navbar__links {
  display: none;
  align-items: center;
  gap: 32px;
}

.navbar__links a {
  color: var(--gc-text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  transition: color 0.15s ease;
}

.navbar__links a:hover {
  color: var(--gc-text);
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar__login {
  padding: 8px 16px;
  color: var(--gc-text);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.15s ease;
}

.navbar__login:hover {
  color: var(--gc-accent);
}

.navbar__cta {
  padding: 10px 20px;
  background: var(--gc-accent);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  border-radius: var(--gc-radius-md);
  transition: all 0.15s ease;
}

.navbar__cta:hover {
  background: var(--gc-accent-hover);
  transform: translateY(-1px);
}

@media (min-width: 768px) {
  .navbar__links {
    display: flex;
  }
}
</style>
