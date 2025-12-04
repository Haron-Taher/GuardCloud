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
          <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"/>
          </svg>
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
            <span v-if="isDark">☀️</span>
            <span v-else>🌙</span>
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
          <div class="hero__badge">🔒 Zero-knowledge encryption</div>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"/>
              </svg>
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
            <div class="feature-icon">🔐</div>
            <h3>Client-side encryption</h3>
            <p>Files are encrypted on your device with per-file keys before upload. We never see your data.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔗</div>
            <h3>Secure sharing</h3>
            <p>Share files with end-to-end encrypted links. Set expiry dates and passwords for extra protection.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>Smart sync</h3>
            <p>Block-level sync conserves bandwidth. Work offline with encrypted local cache.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Cross-platform</h3>
            <p>Native apps for Windows, Mac, iOS, and Android. Access your files anywhere.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🕐</div>
            <h3>Version history</h3>
            <p>Recover previous versions of any file. Point-in-time restore protects against ransomware.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔑</div>
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
              <span class="check">✓</span>
              Client-side encryption by default (AES-256-GCM)
            </li>
            <li>
              <span class="check">✓</span>
              Key wrapping for recipients (RSA-4096 / ECDH)
            </li>
            <li>
              <span class="check">✓</span>
              SSO/SAML, SCIM, DLP & retention policies
            </li>
            <li>
              <span class="check">✓</span>
              SOC 2 Type II & GDPR compliant
            </li>
          </ul>

          <NuxtLink to="/signup" class="btn btn-primary">Start securing your files</NuxtLink>
        </div>

        <div class="security__visual">
          <div class="security__badge">
            <div class="lock-icon">🛡️</div>
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
          <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"/>
          </svg>
          <span>GuardCloud</span>
        </div>
        <nav class="footer__links">
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#pricing">Pricing</a>
          <NuxtLink to="/contact">Contact</NuxtLink>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
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
  font-size: 18px;
  transition: all 0.2s;
}

.theme-btn:hover {
  background: var(--gc-bg-tertiary);
}

/* Navigation */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--gc-bg-primary);
  border-bottom: 1px solid var(--gc-border);
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

.brand-icon {
  width: 28px;
  height: 28px;
  color: var(--gc-primary);
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
  display: inline-block;
  padding: 6px 14px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
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
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--gc-shadow-lg);
  max-width: 500px;
  width: 100%;
}

.hero__card-header {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: var(--gc-bg-tertiary);
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
  height: 280px;
  padding: 32px;
}

.hero__preview svg {
  width: 120px;
  height: 120px;
  color: var(--gc-primary);
  opacity: 0.5;
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
  border-radius: 12px;
  padding: 28px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gc-shadow-lg);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
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
  gap: 12px;
}

.security__list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: var(--gc-text-primary);
}

.check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.security__visual {
  display: flex;
  justify-content: center;
}

.security__badge {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--gc-bg-secondary);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: var(--gc-shadow-lg);
}

.lock-icon {
  font-size: 48px;
}

.security__badge-text strong {
  display: block;
  font-size: 18px;
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
  border-radius: 16px;
  padding: 32px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.price-card--featured {
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 1px var(--gc-primary);
}

.price-card__badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gc-primary);
  color: #fff;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.price-card__header {
  margin-bottom: 16px;
}

.price-card__header h3 {
  font-size: 22px;
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
  font-size: 48px;
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
  padding-left: 24px;
  position: relative;
  color: var(--gc-text-primary);
}

.price-card__features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--gc-primary);
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
  border-radius: 12px;
  padding: 20px 24px;
}

.faq-item summary {
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--gc-text-primary);
}

.faq-item summary::after {
  content: '+';
  font-size: 20px;
  color: var(--gc-text-secondary);
}

.faq-item[open] summary::after {
  content: '−';
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
  background: var(--gc-primary);
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
  gap: 8px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.footer-icon {
  width: 24px;
  height: 24px;
  color: var(--gc-primary);
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
