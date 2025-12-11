<!--
  Landing Page
  
  This meets Functional Requirement #1:
  FR-1: The user SHALL be able to access the web app from their browser of choice by entering in a URL.
  
  This meets Functional Requirement #2:
  FR-2: The user SHALL be prompted for a login or create account option.
  (Sign in and Get Started buttons link to login/signup pages)
-->

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleTheme, init: initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="landing">
    <!-- Navigation -->
    <header class="nav">
      <div class="container nav__inner">
        <NuxtLink to="/" class="brand">
          <img src="~/assets/logos/securecloud.png" alt="GuardCloud" class="brand-img" />
          <span>GuardCloud</span>
        </NuxtLink>

        <nav class="nav__links">
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div class="nav__actions">
          <button class="theme-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
            <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <NuxtLink to="/login" class="btn btn-ghost">Sign in</NuxtLink>
          <NuxtLink to="/signup" class="btn btn-primary">Get started</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__content">
          <div class="hero__badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Zero-knowledge encryption
          </div>
          <h1>Secure cloud storage for teams who care about privacy</h1>
          <p>GuardCloud encrypts your files before they leave your device. Share and collaborate with end-to-end encryption that even we can't read.</p>
          
          <div class="hero__cta">
            <NuxtLink to="/signup" class="btn btn-primary btn-lg">Start free trial</NuxtLink>
            <a href="#features" class="btn btn-ghost btn-lg">Learn more</a>
          </div>

          <div class="hero__stats">
            <div class="stat">
              <strong>AES-256</strong>
              <span>Encryption</span>
            </div>
            <div class="stat">
              <strong>99.99%</strong>
              <span>Uptime</span>
            </div>
            <div class="stat">
              <strong>SOC 2</strong>
              <span>Compliant</span>
            </div>
          </div>
        </div>

        <div class="hero__visual">
          <div class="hero__card">
            <div class="hero__card-header">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="hero__preview">
              <img src="~/assets/logos/securecloud.png" alt="GuardCloud" class="hero__logo" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="features">
      <div class="container">
        <div class="section-header">
          <h2>Everything you need for secure file storage</h2>
          <p>Built from the ground up with privacy and security in mind.</p>
        </div>

        <div class="features__grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>Client-side encryption</h3>
            <p>Files are encrypted on your device with per-file keys before upload. We never see your data.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <h3>Secure sharing</h3>
            <p>Share files with end-to-end encrypted links. Set expiry dates and passwords for extra protection.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </div>
            <h3>Smart sync</h3>
            <p>Block-level sync conserves bandwidth. Work offline with encrypted local cache.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <path d="M12 18h.01"/>
              </svg>
            </div>
            <h3>Cross-platform</h3>
            <p>Native apps for Windows, Mac, iOS, and Android. Access your files anywhere.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3>Version history</h3>
            <p>Recover previous versions of any file. Point-in-time restore protects against ransomware.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
            </div>
            <h3>Bring your own keys</h3>
            <p>Integrate with your organization's KMS/HSM. Full control over your encryption keys.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Security -->
    <section id="security" class="security">
      <div class="container security__inner">
        <div class="security__content">
          <h2>Security that starts on your device</h2>
          <p>Per-file AES-256-GCM encryption, modern key exchange, and strong authentication. Add DLP, anomaly detection, and retention controls as you scale.</p>
          
          <ul class="security__list">
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </span>
              Client-side encryption by default (AES-256-GCM)
            </li>
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </span>
              Key wrapping for recipients (RSA-4096 / ECDH)
            </li>
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </span>
              SSO/SAML, SCIM, DLP & retention policies
            </li>
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </span>
              SOC 2 Type II & GDPR compliant
            </li>
          </ul>

          <NuxtLink to="/signup" class="btn btn-primary">Start securing your files</NuxtLink>
        </div>

        <div class="security__visual">
          <div class="security__badge">
            <div class="shield-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div class="security__badge-text">
              <strong>Zero Knowledge</strong>
              <span>Your keys, your data</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="pricing">
      <div class="container">
        <div class="section-header">
          <h2>Simple, transparent pricing</h2>
          <p>Start free. Upgrade when you need more.</p>
        </div>

        <div class="pricing__grid">
          <div class="price-card">
            <div class="price-card__header">
              <h3>Free</h3>
              <p>For personal use</p>
            </div>
            <div class="price-card__price">
              <strong>$0</strong>
              <span>/month</span>
            </div>
            <ul class="price-card__features">
              <li>5 GB storage</li>
              <li>Client-side encryption</li>
              <li>Mobile & desktop apps</li>
              <li>7-day version history</li>
            </ul>
            <NuxtLink to="/signup" class="btn btn-ghost price-card__cta">Get started</NuxtLink>
          </div>

          <div class="price-card price-card--featured">
            <div class="price-card__badge">Most popular</div>
            <div class="price-card__header">
              <h3>Pro</h3>
              <p>For professionals</p>
            </div>
            <div class="price-card__price">
              <strong>$9</strong>
              <span>/month</span>
            </div>
            <ul class="price-card__features">
              <li>100 GB storage</li>
              <li>Everything in Free</li>
              <li>Priority support</li>
              <li>30-day version history</li>
              <li>Advanced sharing controls</li>
            </ul>
            <NuxtLink to="/signup" class="btn btn-primary price-card__cta">Start free trial</NuxtLink>
          </div>

          <div class="price-card">
            <div class="price-card__header">
              <h3>Team</h3>
              <p>For organizations</p>
            </div>
            <div class="price-card__price">
              <strong>$15</strong>
              <span>/user/month</span>
            </div>
            <ul class="price-card__features">
              <li>1 TB storage per user</li>
              <li>Everything in Pro</li>
              <li>SSO/SAML integration</li>
              <li>Admin console</li>
              <li>BYOK support</li>
              <li>Audit logs</li>
            </ul>
            <NuxtLink to="/contact" class="btn btn-ghost price-card__cta">Contact sales</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="faq">
      <div class="container">
        <div class="section-header">
          <h2>Frequently asked questions</h2>
        </div>

        <div class="faq__grid">
          <details class="faq-item" open>
            <summary>What does "zero-knowledge" mean?</summary>
            <p>Your files are encrypted on your device before upload. We don't have the keys to decrypt your data—only you do. Even if our servers were compromised, your files would remain encrypted and unreadable.</p>
          </details>

          <details class="faq-item">
            <summary>How does encrypted sharing work?</summary>
            <p>We wrap the file key for each recipient using their public key. Recipients decrypt locally—we never see the plaintext. You can add password protection and expiry dates to shared links.</p>
          </details>

          <details class="faq-item">
            <summary>Can I use my own encryption keys?</summary>
            <p>Yes! Our BYOK (Bring Your Own Keys) feature lets you integrate with your organization's KMS/HSM. You maintain full control over key rotation and escrow policies.</p>
          </details>

          <details class="faq-item">
            <summary>What if I lose my device?</summary>
            <p>You can remotely sign out to invalidate all tokens. Keys can be rotated, and version history lets you restore clean copies. Optional anomaly detection flags unusual activity.</p>
          </details>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container cta__inner">
        <h2>Ready to secure your files?</h2>
        <p>Start your free trial today. No credit card required.</p>
        <div class="cta__actions">
          <NuxtLink to="/signup" class="btn btn-white btn-lg">Create free account</NuxtLink>
          <NuxtLink to="/contact" class="btn btn-outline-white btn-lg">Talk to sales</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__brand">
          <img src="~/assets/logos/securecloud.png" alt="GuardCloud" class="footer-img" />
          <span>GuardCloud</span>
        </div>
        <nav class="footer__links">
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#pricing">Pricing</a>
          <NuxtLink to="/docs">Documentation</NuxtLink>
          <NuxtLink to="/contact">Contact</NuxtLink>
          <NuxtLink to="/privacy">Privacy</NuxtLink>
          <NuxtLink to="/terms">Terms</NuxtLink>
        </nav>
        <p class="footer__copy">© 2025 GuardCloud. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  background: var(--gc-bg-primary);
  color: var(--gc-text-primary);
  min-height: 100vh;
}

.container {
  width: min(1200px, 92vw);
  margin-inline: auto;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--gc-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--gc-primary-hover);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--gc-text-primary);
  border-color: var(--gc-border);
}

.btn-ghost:hover {
  background: var(--gc-bg-tertiary);
}

.btn-white {
  background: white;
  color: var(--gc-primary);
}

.btn-white:hover {
  background: #f1f5f9;
}

.btn-outline-white {
  background: transparent;
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-lg {
  padding: 14px 28px;
  font-size: 16px;
}

.theme-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gc-text-secondary);
}

.theme-btn svg {
  width: 20px;
  height: 20px;
}

.theme-btn:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

/* Navigation */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--gc-bg-primary);
  border-bottom: 1px solid var(--gc-border);
  backdrop-filter: blur(10px);
}

.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: var(--gc-text-primary);
  text-decoration: none;
}

.brand-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.nav__links {
  display: none;
  gap: 32px;
}

.nav__links a {
  color: var(--gc-text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.nav__links a:hover {
  color: var(--gc-text-primary);
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (min-width: 768px) {
  .nav__links {
    display: flex;
  }
}

/* Hero */
.hero {
  padding: clamp(48px, 10vw, 96px) 0;
}

.hero__inner {
  display: grid;
  gap: 48px;
  align-items: center;
}

@media (min-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr 1fr;
    gap: 64px;
  }
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.hero__badge svg {
  width: 16px;
  height: 16px;
}

.hero__content h1 {
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  color: var(--gc-text-primary);
}

.hero__content p {
  font-size: 18px;
  color: var(--gc-text-secondary);
  line-height: 1.6;
  margin: 0 0 28px;
  max-width: 540px;
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 40px;
}

.hero__stats {
  display: flex;
  gap: 32px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.stat span {
  font-size: 14px;
  color: var(--gc-text-secondary);
}

.hero__visual {
  display: flex;
  justify-content: center;
}

.hero__card {
  background: var(--gc-bg-secondary);
  border: 1px solid var(--gc-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
}

.hero__card-header {
  display: flex;
  gap: 8px;
  padding: 14px 18px;
  background: var(--gc-bg-tertiary);
  border-bottom: 1px solid var(--gc-border);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green { background: #28c840; }

.hero__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  padding: 32px;
  background: linear-gradient(135deg, var(--gc-bg-primary) 0%, var(--gc-bg-secondary) 100%);
}

.hero__logo {
  width: 140px;
  height: 140px;
  object-fit: contain;
  filter: drop-shadow(0 20px 40px rgba(99, 102, 241, 0.3));
}

/* Section header */
.section-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 48px;
}

.section-header h2 {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--gc-text-primary);
}

.section-header p {
  font-size: 18px;
  color: var(--gc-text-secondary);
  margin: 0;
}

/* Features */
.features {
  padding: clamp(64px, 10vw, 120px) 0;
  background: var(--gc-bg-secondary);
}

.features__grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.feature-card {
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  padding: 28px;
  transition: all 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.12);
  border-color: var(--gc-primary);
}

.feature-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 14px;
  margin-bottom: 18px;
  color: var(--gc-primary);
}

.feature-icon svg {
  width: 26px;
  height: 26px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 10px;
  color: var(--gc-text-primary);
}

.feature-card p {
  font-size: 15px;
  color: var(--gc-text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Security */
.security {
  padding: clamp(64px, 10vw, 120px) 0;
}

.security__inner {
  display: grid;
  gap: 48px;
  align-items: center;
}

@media (min-width: 900px) {
  .security__inner {
    grid-template-columns: 1.2fr 0.8fr;
    gap: 64px;
  }
}

.security__content h2 {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--gc-text-primary);
}

.security__content > p {
  font-size: 17px;
  color: var(--gc-text-secondary);
  margin: 0 0 28px;
  line-height: 1.6;
}

.security__list {
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  display: grid;
  gap: 14px;
}

.security__list li {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 15px;
  color: var(--gc-text-primary);
}

.check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.check svg {
  width: 14px;
  height: 14px;
}

.security__visual {
  display: flex;
  justify-content: center;
}

.security__badge {
  display: flex;
  align-items: center;
  gap: 18px;
  background: var(--gc-bg-secondary);
  border: 1px solid var(--gc-border);
  border-radius: 20px;
  padding: 28px 36px;
  box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.12);
}

.shield-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 16px;
  color: var(--gc-primary);
}

.shield-icon svg {
  width: 32px;
  height: 32px;
}

.security__badge-text strong {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.security__badge-text span {
  font-size: 14px;
  color: var(--gc-text-secondary);
}

/* Pricing */
.pricing {
  padding: clamp(64px, 10vw, 120px) 0;
  background: var(--gc-bg-secondary);
}

.pricing__grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  max-width: 1000px;
  margin: 0 auto;
}

.price-card {
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 20px;
  padding: 32px;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
}

.price-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.12);
}

.price-card--featured {
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 1px var(--gc-primary), 0 20px 50px -15px rgba(99, 102, 241, 0.25);
}

.price-card__badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gc-primary);
  color: #fff;
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.price-card__header {
  margin-bottom: 16px;
}

.price-card__header h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--gc-text-primary);
}

.price-card__header p {
  font-size: 14px;
  color: var(--gc-text-secondary);
  margin: 0;
}

.price-card__price {
  margin-bottom: 24px;
}

.price-card__price strong {
  font-size: 52px;
  font-weight: 800;
  color: var(--gc-text-primary);
}

.price-card__price span {
  font-size: 16px;
  color: var(--gc-text-secondary);
}

.price-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: grid;
  gap: 12px;
  flex: 1;
}

.price-card__features li {
  font-size: 15px;
  padding-left: 28px;
  position: relative;
  color: var(--gc-text-primary);
}

.price-card__features li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
}

.price-card__features li::after {
  content: '✓';
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gc-primary);
  font-size: 11px;
  font-weight: 700;
}

.price-card__cta {
  width: 100%;
  text-align: center;
}

/* FAQ */
.faq {
  padding: clamp(64px, 10vw, 120px) 0;
}

.faq__grid {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
}

.faq-item {
  background: var(--gc-bg-secondary);
  border: 1px solid var(--gc-border);
  border-radius: 14px;
  padding: 20px 24px;
  transition: all 0.2s;
}

.faq-item:hover {
  border-color: var(--gc-primary);
}

.faq-item summary {
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--gc-text-primary);
  font-size: 16px;
}

.faq-item summary::after {
  content: '+';
  font-size: 22px;
  color: var(--gc-text-secondary);
  transition: transform 0.2s;
}

.faq-item[open] summary::after {
  content: '−';
  color: var(--gc-primary);
}

.faq-item p {
  margin: 16px 0 0;
  font-size: 15px;
  color: var(--gc-text-secondary);
  line-height: 1.6;
}

/* CTA */
.cta {
  padding: clamp(64px, 10vw, 100px) 0;
  background: linear-gradient(135deg, var(--gc-primary) 0%, #8b5cf6 100%);
  color: #fff;
}

.cta__inner {
  text-align: center;
}

.cta h2 {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  margin: 0 0 12px;
}

.cta p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 28px;
}

.cta__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Footer */
.footer {
  padding: 32px 0;
  border-top: 1px solid var(--gc-border);
  background: var(--gc-bg-primary);
}

.footer__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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
  color: var(--gc-text-primary);
}

.footer-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
}

.footer__links a {
  color: var(--gc-text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.15s;
}

.footer__links a:hover {
  color: var(--gc-text-primary);
}

.footer__copy {
  font-size: 14px;
  color: var(--gc-text-secondary);
  margin: 0;
}
</style>
