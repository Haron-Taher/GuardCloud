<script setup>
import poster from '~/assets/logos/securecloud.png'
</script>

<template>
  <section id="overview" class="hero">
    <div class="container hero__inner">
      <div class="hero__copy">
        <h1>Zero-knowledge cloud storage for teams</h1>

        <p>
          GuardCloud encrypts files <em>before</em> they leave your device.
          Share and collaborate with end-to-end encryption, optional malware
          scanning, and anomaly-aware protections.
        </p>

        <div class="hero__cta">
          <NuxtLink class="btn btn--primary" to="/signup">Start free</NuxtLink>
          <NuxtLink class="btn btn--ghost" to="#pricing">See pricing</NuxtLink>
        </div>

        <ul class="hero__bullets" role="list">
          <li>Client-side AES-256 with per-file keys</li>
          <li>End-to-end encrypted links & shared folders</li>
          <li>Anomaly detection & recovery points</li>
        </ul>
      </div>

      <div class="hero__media">
        <figure class="device">
          <img :src="poster" class="device__screen" alt="App preview" />
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero
{
  padding: clamp(44px, 8vw, 88px) 0;
}

.hero__inner
{
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: center;
}

@media (min-width: 980px)
{
  .hero__inner
  {
    grid-template-columns: 1.1fr 1fr;
    gap: 42px;
  }
}

.hero__copy h1
{
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
}

.hero__copy p
{
  color: var(--muted);
  font-size: clamp(16px, 1.6vw, 18px);
  margin: 0 0 18px;
  max-width: 52ch;
}

.hero__cta
{
  display: flex;
  gap: 10px;
  margin: 18px 0 8px;
}

.hero__bullets
{
  display: grid;
  gap: 6px;
  margin-top: 14px;
  color: var(--muted);
}

.hero__bullets li
{
  list-style: none;
  padding-left: 22px;
  position: relative;
}

.hero__bullets li::before
{
  content: '✓';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
}

.hero__media
{
  display: grid;
  place-items: center;
}

.device
{
  width: min(680px, 90vw);
  aspect-ratio: 16/10;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 20px 40px color-mix(in srgb, black 25%, transparent);
  overflow: hidden;
}

.device__screen
{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
