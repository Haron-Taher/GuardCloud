<script setup>
import logo from '~/assets/logos/securecloud.png'
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <img :src="logo" width="24" height="24" alt="GuardCloud logo" />
        <span>GuardCloud</span>
      </div>

      <nav class="footer__links">
        <a href="#features">Features</a>
        <a href="#security">Security</a>
        <a href="#pricing">Pricing</a>
        <NuxtLink to="/">Privacy</NuxtLink>
        <NuxtLink to="/">Terms</NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer
{
  border-top: 1px solid var(--border);
  padding: 22px 0;
}

.footer__inner
{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.footer__brand
{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.footer__links
{
  display: flex;
  gap: 16px;
}

.footer__links a
{
  color: var(--muted);
  text-decoration: none;
}

.footer__links a:hover
{
  color: var(--text);
}
</style>
