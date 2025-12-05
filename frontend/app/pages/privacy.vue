<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleTheme, init: initTheme } = useTheme()

onMounted(() => {
  initTheme()
})

const lastUpdated = 'December 5, 2025'
</script>

<template>
  <div class="legal-page">
    <!-- Navigation -->
    <header class="nav">
      <div class="container nav__inner">
        <NuxtLink to="/" class="brand">
          <img src="~/assets/logos/securecloud.png" alt="GuardCloud" class="brand-img" />
          <span>GuardCloud</span>
        </NuxtLink>
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
      <div class="container">
        <div class="hero__badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Your Privacy Matters
        </div>
        <h1>Privacy Policy</h1>
        <p>Learn how GuardCloud collects, uses, and protects your personal information.</p>
        <span class="last-updated">Last updated: {{ lastUpdated }}</span>
      </div>
    </section>

    <!-- Content -->
    <section class="content">
      <div class="container">
        <div class="content__wrapper">
          <!-- Table of Contents -->
          <aside class="toc">
            <h3>Contents</h3>
            <nav>
              <a href="#introduction">Introduction</a>
              <a href="#information-we-collect">Information We Collect</a>
              <a href="#how-we-use">How We Use Your Information</a>
              <a href="#data-storage">Data Storage & Security</a>
              <a href="#zero-knowledge">Zero-Knowledge Architecture</a>
              <a href="#sharing">Information Sharing</a>
              <a href="#cookies">Cookies & Tracking</a>
              <a href="#your-rights">Your Rights</a>
              <a href="#data-retention">Data Retention</a>
              <a href="#children">Children's Privacy</a>
              <a href="#changes">Changes to This Policy</a>
              <a href="#contact">Contact Us</a>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="main-content">
            <section id="introduction" class="section">
              <h2>Introduction</h2>
              <p>GuardCloud ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cloud storage service.</p>
              <p>GuardCloud is designed with privacy as a core principle. Our zero-knowledge encryption architecture ensures that your files remain private and accessible only to you and those you choose to share them with.</p>
            </section>

            <section id="information-we-collect" class="section">
              <h2>Information We Collect</h2>
              
              <h3>Account Information</h3>
              <p>When you create an account, we collect:</p>
              <ul>
                <li>Username (required)</li>
                <li>Email address (optional, for account recovery)</li>
                <li>Password hash (we never store your actual password)</li>
              </ul>

              <h3>File Metadata</h3>
              <p>We store metadata about your files to provide our service:</p>
              <ul>
                <li>File names and sizes</li>
                <li>Upload and modification dates</li>
                <li>Folder structure</li>
                <li>Share link settings (expiry, download limits)</li>
              </ul>

              <div class="info-box">
                <div class="info-box__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <strong>Important:</strong> We cannot access the contents of your files. All file data is encrypted on your device before upload using keys that only you control.
                </div>
              </div>

              <h3>Usage Information</h3>
              <p>We automatically collect certain information when you use GuardCloud:</p>
              <ul>
                <li>IP address and approximate location</li>
                <li>Browser type and device information</li>
                <li>Activity logs (login times, file operations)</li>
                <li>Performance and error data</li>
              </ul>
            </section>

            <section id="how-we-use" class="section">
              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process and manage your account</li>
                <li>Send you important service updates and security alerts</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section id="data-storage" class="section">
              <h2>Data Storage & Security</h2>
              <p>Your data security is our top priority. We implement multiple layers of protection:</p>
              
              <h3>Encryption</h3>
              <ul>
                <li><strong>End-to-end encryption:</strong> Files are encrypted on your device using AES-256-GCM before upload</li>
                <li><strong>In-transit encryption:</strong> All communications use TLS 1.3</li>
                <li><strong>At-rest encryption:</strong> Server-side storage is additionally encrypted</li>
              </ul>

              <h3>Infrastructure Security</h3>
              <ul>
                <li>SOC 2 Type II certified data centers</li>
                <li>Regular security audits and penetration testing</li>
                <li>Intrusion detection and prevention systems</li>
                <li>24/7 infrastructure monitoring</li>
              </ul>
            </section>

            <section id="zero-knowledge" class="section">
              <h2>Zero-Knowledge Architecture</h2>
              <p>GuardCloud employs a zero-knowledge encryption model, which means:</p>
              <ul>
                <li>Your encryption keys are derived from your password on your device</li>
                <li>We never have access to your decryption keys</li>
                <li>Your files are encrypted before leaving your device</li>
                <li>Even our employees cannot read your file contents</li>
                <li>We cannot reset your password to decrypt your files</li>
              </ul>

              <div class="warning-box">
                <div class="warning-box__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <strong>Password Recovery:</strong> Due to our zero-knowledge design, if you forget your password and don't have account recovery set up, your encrypted files cannot be recovered. Please keep your password safe.
                </div>
              </div>
            </section>

            <section id="sharing" class="section">
              <h2>Information Sharing</h2>
              <p>We do not sell your personal information. We may share information only in these circumstances:</p>
              
              <h3>Service Providers</h3>
              <p>We work with trusted third parties who assist in operating our service, including:</p>
              <ul>
                <li>Cloud infrastructure providers</li>
                <li>Payment processors</li>
                <li>Analytics services</li>
              </ul>

              <h3>Legal Requirements</h3>
              <p>We may disclose information if required by law or in response to valid legal processes. However, due to our zero-knowledge architecture, we can only provide encrypted data and metadata—we cannot provide decrypted file contents.</p>

              <h3>Business Transfers</h3>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred. We will notify you of any such change.</p>
            </section>

            <section id="cookies" class="section">
              <h2>Cookies & Tracking</h2>
              <p>We use minimal, essential cookies to:</p>
              <ul>
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences (like dark mode)</li>
                <li>Understand how you use our service to improve it</li>
              </ul>
              <p>We do not use third-party advertising cookies or cross-site tracking.</p>
            </section>

            <section id="your-rights" class="section">
              <h2>Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a standard format</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
              </ul>
              <p>To exercise these rights, please contact us at <a href="mailto:privacy@guardcloud.io">privacy@guardcloud.io</a>.</p>
            </section>

            <section id="data-retention" class="section">
              <h2>Data Retention</h2>
              <p>We retain your data as follows:</p>
              <ul>
                <li><strong>Active accounts:</strong> Data is retained while your account is active</li>
                <li><strong>Deleted files:</strong> Permanently removed from trash after 30 days</li>
                <li><strong>Closed accounts:</strong> Data is deleted within 90 days of account closure</li>
                <li><strong>Logs:</strong> Activity logs are retained for 12 months for security purposes</li>
              </ul>
            </section>

            <section id="children" class="section">
              <h2>Children's Privacy</h2>
              <p>GuardCloud is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it promptly.</p>
            </section>

            <section id="changes" class="section">
              <h2>Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
              <ul>
                <li>Posting the new policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending an email notification for significant changes</li>
              </ul>
            </section>

            <section id="contact" class="section">
              <h2>Contact Us</h2>
              <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
              <div class="contact-info">
                <p><strong>Email:</strong> <a href="mailto:privacy@guardcloud.io">privacy@guardcloud.io</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@guardcloud.io">support@guardcloud.io</a></p>
              </div>
              <NuxtLink to="/contact" class="btn btn-primary">Contact Us</NuxtLink>
            </section>
          </main>
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
          <NuxtLink to="/">Home</NuxtLink>
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
.legal-page {
  min-height: 100vh;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
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

/* Nav */
.nav {
  background: var(--gc-bg-primary);
  border-bottom: 1px solid var(--gc-border);
}

.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  color: var(--gc-text-primary);
  text-decoration: none;
}

.brand-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Hero */
.hero {
  padding: clamp(40px, 8vw, 80px) 0 clamp(24px, 4vw, 40px);
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
  margin-bottom: 16px;
}

.hero__badge svg {
  width: 16px;
  height: 16px;
}

.hero h1 {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  margin: 0 0 12px;
  color: var(--gc-text-primary);
}

.hero p {
  font-size: 18px;
  color: var(--gc-text-secondary);
  margin: 0 0 16px;
  max-width: 600px;
}

.last-updated {
  font-size: 14px;
  color: var(--gc-text-secondary);
  background: var(--gc-bg-primary);
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--gc-border);
}

/* Content */
.content {
  padding-bottom: clamp(48px, 8vw, 96px);
}

.content__wrapper {
  display: grid;
  gap: 32px;
}

@media (min-width: 1024px) {
  .content__wrapper {
    grid-template-columns: 240px 1fr;
    gap: 48px;
  }
}

/* TOC */
.toc {
  position: sticky;
  top: 100px;
  align-self: start;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  padding: 20px;
  display: none;
}

@media (min-width: 1024px) {
  .toc {
    display: block;
  }
}

.toc h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--gc-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px;
}

.toc nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc a {
  font-size: 14px;
  color: var(--gc-text-secondary);
  text-decoration: none;
  padding: 6px 0;
  transition: color 0.15s;
}

.toc a:hover {
  color: var(--gc-primary);
}

/* Main Content */
.main-content {
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 20px;
  padding: clamp(24px, 4vw, 40px);
}

.section {
  margin-bottom: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--gc-border);
}

.section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--gc-text-primary);
  margin: 0 0 16px;
}

.section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gc-text-primary);
  margin: 24px 0 12px;
}

.section p {
  font-size: 15px;
  line-height: 1.7;
  color: var(--gc-text-secondary);
  margin: 0 0 16px;
}

.section ul {
  margin: 0 0 16px;
  padding-left: 24px;
}

.section li {
  font-size: 15px;
  line-height: 1.7;
  color: var(--gc-text-secondary);
  margin-bottom: 8px;
}

.section a {
  color: var(--gc-primary);
  text-decoration: none;
}

.section a:hover {
  text-decoration: underline;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 16px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.info-box__icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: var(--gc-primary);
}

.info-box__icon svg {
  width: 100%;
  height: 100%;
}

.info-box strong {
  color: var(--gc-primary);
}

.info-box div:last-child {
  font-size: 14px;
  line-height: 1.6;
  color: var(--gc-text-primary);
}

/* Warning Box */
.warning-box {
  display: flex;
  gap: 16px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.warning-box__icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: #f59e0b;
}

.warning-box__icon svg {
  width: 100%;
  height: 100%;
}

.warning-box strong {
  color: #f59e0b;
}

.warning-box div:last-child {
  font-size: 14px;
  line-height: 1.6;
  color: var(--gc-text-primary);
}

/* Contact Info */
.contact-info {
  background: var(--gc-bg-secondary);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.contact-info p {
  margin: 0 0 8px;
}

.contact-info p:last-child {
  margin-bottom: 0;
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
