<script setup>
import logo from '~/assets/logos/securecloud.png'
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <img :src="logo" width="28" height="28" alt="GuardCloud" />
        <span>GuardCloud</span>
      </div>

      <nav class="footer__links">
        <a href="#features">Features</a>
        <a href="#security">Security</a>
        <a href="#pricing">Pricing</a>
        <NuxtLink to="/contact">Contact</NuxtLink>
        <NuxtLink to="/">Privacy</NuxtLink>
        <NuxtLink to="/">Terms</NuxtLink>
      </nav>

      <p class="footer__copy">
        © {{ new Date().getFullYear() }} GuardCloud. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--gc-border);
  padding: 40px 24px;
  background: color-mix(in srgb, var(--gc-card) 30%, transparent);
}

.footer__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

@media (min-width: 768px) {
  .footer__inner {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 16px;
  color: var(--gc-text);
}

.footer__brand img {
  border-radius: 6px;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
}

.footer__links a {
  color: var(--gc-text-muted);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.15s ease;
}

.footer__links a:hover {
  color: var(--gc-text);
}

.footer__copy {
  margin: 0;
  font-size: 13px;
  color: var(--gc-text-muted);
}

@media (min-width: 768px) {
  .footer__copy {
    order: -1;
  }
  
  .footer__inner {
    flex-wrap: wrap;
  }
}
</style>
