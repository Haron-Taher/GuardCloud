<script setup>
import logo from '~/assets/logos/securecloud.png'
</script>

<template>
  <section class="hero">
    <div class="hero__inner">
      <div class="hero__content">
        <span class="hero__badge">
          🔒 End-to-end encrypted
        </span>
        
        <h1 class="hero__title">
          Zero-knowledge cloud storage for modern teams
        </h1>
        
        <p class="hero__subtitle">
          GuardCloud encrypts your files before they leave your device. 
          Share and collaborate with confidence — only you and the people you choose can see your data.
        </p>

        <div class="hero__actions">
          <NuxtLink to="/signup" class="hero__cta">
            Start free trial
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </NuxtLink>
          <a href="#features" class="hero__secondary">
            Learn more
          </a>
        </div>

        <div class="hero__features">
          <div class="hero__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M5 13L9 17L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>AES-256 encryption</span>
          </div>
          <div class="hero__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M5 13L9 17L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>E2EE sharing</span>
          </div>
          <div class="hero__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M5 13L9 17L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>15GB free</span>
          </div>
        </div>
      </div>

      <div class="hero__visual">
        <div class="hero__preview">
          <img :src="logo" alt="GuardCloud Dashboard" class="hero__image" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 140px 24px 80px;
  background: 
    radial-gradient(ellipse 80% 50% at 50% -20%, var(--gc-accent-light), transparent),
    var(--gc-bg);
}

.hero__inner {
  display: grid;
  gap: 48px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr 1fr;
    gap: 64px;
  }
}

.hero__content {
  max-width: 560px;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--gc-accent-light);
  border: 1px solid color-mix(in srgb, var(--gc-accent) 20%, transparent);
  border-radius: var(--gc-radius-full);
  font-size: 13px;
  font-weight: 600;
  color: var(--gc-accent);
  margin-bottom: 24px;
}

.hero__title {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  color: var(--gc-text);
}

.hero__subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: var(--gc-text-muted);
  margin: 0 0 32px;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 40px;
}

.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--gc-accent);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  border-radius: var(--gc-radius-lg);
  transition: all 0.15s ease;
}

.hero__cta:hover {
  background: var(--gc-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--gc-accent) 30%, transparent);
}

.hero__secondary {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  color: var(--gc-text);
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  border: 1px solid var(--gc-border);
  border-radius: var(--gc-radius-lg);
  transition: all 0.15s ease;
}

.hero__secondary:hover {
  background: var(--gc-card);
  border-color: var(--gc-text-muted);
}

.hero__features {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.hero__feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--gc-text-muted);
}

.hero__feature svg {
  color: var(--gc-success);
}

.hero__visual {
  display: flex;
  justify-content: center;
}

.hero__preview {
  width: 100%;
  max-width: 540px;
  aspect-ratio: 4/3;
  background: var(--gc-card);
  border: 1px solid var(--gc-border);
  border-radius: var(--gc-radius-xl);
  box-shadow: var(--gc-shadow-xl);
  overflow: hidden;
  display: grid;
  place-items: center;
}

.hero__image {
  width: 50%;
  height: auto;
  opacity: 0.8;
}
</style>
