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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
          Legal Agreement
        </div>
        <h1>Terms of Service</h1>
        <p>Please read these terms carefully before using GuardCloud's services.</p>
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
              <a href="#acceptance">Acceptance of Terms</a>
              <a href="#eligibility">Eligibility</a>
              <a href="#account">Your Account</a>
              <a href="#service">Service Description</a>
              <a href="#acceptable-use">Acceptable Use</a>
              <a href="#your-content">Your Content</a>
              <a href="#intellectual-property">Intellectual Property</a>
              <a href="#payment">Payment Terms</a>
              <a href="#termination">Termination</a>
              <a href="#disclaimers">Disclaimers</a>
              <a href="#limitation">Limitation of Liability</a>
              <a href="#indemnification">Indemnification</a>
              <a href="#disputes">Dispute Resolution</a>
              <a href="#changes">Changes to Terms</a>
              <a href="#contact">Contact Us</a>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="main-content">
            <section id="acceptance" class="section">
              <h2>1. Acceptance of Terms</h2>
              <p>Welcome to GuardCloud. These Terms of Service ("Terms") govern your access to and use of GuardCloud's website, applications, and cloud storage services (collectively, the "Service").</p>
              <p>By creating an account, accessing, or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.</p>
              <p>These Terms constitute a legally binding agreement between you and GuardCloud. Please read them carefully.</p>
            </section>

            <section id="eligibility" class="section">
              <h2>2. Eligibility</h2>
              <p>To use GuardCloud, you must:</p>
              <ul>
                <li>Be at least 13 years of age (or the minimum age required in your jurisdiction)</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
                <li>Not be prohibited from using the Service under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
              </ul>
              <p>If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.</p>
            </section>

            <section id="account" class="section">
              <h2>3. Your Account</h2>
              
              <h3>Account Registration</h3>
              <p>To access most features of the Service, you must create an account. When registering, you agree to:</p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information as needed</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>

              <h3>Account Security</h3>
              <p>You are responsible for all activities that occur under your account. GuardCloud uses zero-knowledge encryption, which means:</p>
              <ul>
                <li>Your password is used to derive your encryption keys</li>
                <li>We cannot access your encrypted files</li>
                <li>We cannot recover your data if you lose your password</li>
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
                  <strong>Important:</strong> Due to our zero-knowledge architecture, if you lose your password and have not set up account recovery, your encrypted data will be permanently inaccessible. Please store your password securely.
                </div>
              </div>
            </section>

            <section id="service" class="section">
              <h2>4. Service Description</h2>
              <p>GuardCloud provides a secure, end-to-end encrypted cloud storage service that allows you to:</p>
              <ul>
                <li>Store files securely in the cloud with client-side encryption</li>
                <li>Organize files into folders</li>
                <li>Share files with others via encrypted links</li>
                <li>Access your files from multiple devices</li>
                <li>Manage file versions and recover from trash</li>
              </ul>

              <h3>Service Availability</h3>
              <p>We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to:</p>
              <ul>
                <li>Scheduled maintenance (with advance notice when possible)</li>
                <li>Emergency repairs</li>
                <li>Circumstances beyond our reasonable control</li>
              </ul>
            </section>

            <section id="acceptable-use" class="section">
              <h2>5. Acceptable Use Policy</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Store, share, or distribute illegal content</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Store or distribute malware, viruses, or harmful code</li>
                <li>Harass, abuse, or harm others</li>
                <li>Store child sexual abuse material (CSAM)</li>
                <li>Engage in fraud or deceptive practices</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Circumvent storage limits or security measures</li>
                <li>Resell or redistribute the Service without authorization</li>
              </ul>

              <div class="info-box">
                <div class="info-box__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <div>
                  <strong>Note:</strong> While we cannot see the contents of your encrypted files, we reserve the right to terminate accounts that violate these terms based on available metadata, user reports, or legal requirements.
                </div>
              </div>
            </section>

            <section id="your-content" class="section">
              <h2>6. Your Content</h2>
              
              <h3>Ownership</h3>
              <p>You retain all ownership rights to the content you upload to GuardCloud. We do not claim any intellectual property rights over your content.</p>

              <h3>License to GuardCloud</h3>
              <p>By uploading content, you grant GuardCloud a limited license to:</p>
              <ul>
                <li>Store and transmit your encrypted content to provide the Service</li>
                <li>Create backups for redundancy and data protection</li>
                <li>Make your content available when you share it with others</li>
              </ul>
              <p>This license terminates when you delete your content or close your account.</p>

              <h3>Your Responsibilities</h3>
              <p>You are solely responsible for:</p>
              <ul>
                <li>The content you upload and share</li>
                <li>Ensuring you have the rights to upload content</li>
                <li>Backing up important data</li>
                <li>Complying with applicable laws regarding your content</li>
              </ul>
            </section>

            <section id="intellectual-property" class="section">
              <h2>7. Intellectual Property</h2>
              <p>The GuardCloud name, logo, website, and Service (excluding your content) are owned by GuardCloud and protected by intellectual property laws.</p>
              <p>You may not:</p>
              <ul>
                <li>Copy, modify, or distribute our Service or content</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use our trademarks without written permission</li>
                <li>Remove any copyright or proprietary notices</li>
              </ul>
            </section>

            <section id="payment" class="section">
              <h2>8. Payment Terms</h2>
              
              <h3>Free Tier</h3>
              <p>GuardCloud offers a free tier with limited storage. Free accounts are subject to the same Terms of Service.</p>

              <h3>Paid Plans</h3>
              <p>For paid subscriptions:</p>
              <ul>
                <li>Fees are charged in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>Prices may change with 30 days' notice</li>
                <li>You are responsible for applicable taxes</li>
              </ul>

              <h3>Cancellation</h3>
              <p>You may cancel your subscription at any time. Upon cancellation:</p>
              <ul>
                <li>You will retain access until the end of the billing period</li>
                <li>Your account will revert to the free tier</li>
                <li>Files exceeding the free tier limit may become inaccessible</li>
              </ul>
            </section>

            <section id="termination" class="section">
              <h2>9. Termination</h2>
              
              <h3>Termination by You</h3>
              <p>You may close your account at any time through the account settings. Upon termination:</p>
              <ul>
                <li>Your data will be permanently deleted within 90 days</li>
                <li>Shared links will become inactive</li>
                <li>Paid subscriptions will not be refunded for remaining time</li>
              </ul>

              <h3>Termination by GuardCloud</h3>
              <p>We may suspend or terminate your access if:</p>
              <ul>
                <li>You violate these Terms</li>
                <li>Your account is inactive for an extended period</li>
                <li>We are required to do so by law</li>
                <li>Continued operation is no longer commercially viable</li>
              </ul>
              <p>We will provide reasonable notice when possible and allow you to export your data.</p>
            </section>

            <section id="disclaimers" class="section">
              <h2>10. Disclaimers</h2>
              <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
              <ul>
                <li>WARRANTIES OF MERCHANTABILITY</li>
                <li>FITNESS FOR A PARTICULAR PURPOSE</li>
                <li>NON-INFRINGEMENT</li>
                <li>UNINTERRUPTED OR ERROR-FREE OPERATION</li>
              </ul>
              <p>We do not warrant that the Service will meet your requirements or that any errors will be corrected. Use of the Service is at your own risk.</p>
            </section>

            <section id="limitation" class="section">
              <h2>11. Limitation of Liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, GUARDCLOUD SHALL NOT BE LIABLE FOR:</p>
              <ul>
                <li>INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES</li>
                <li>LOSS OF DATA, PROFITS, OR BUSINESS OPPORTUNITIES</li>
                <li>DAMAGES EXCEEDING THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS</li>
              </ul>
              <p>Some jurisdictions do not allow these limitations, so they may not apply to you.</p>
            </section>

            <section id="indemnification" class="section">
              <h2>12. Indemnification</h2>
              <p>You agree to indemnify, defend, and hold harmless GuardCloud and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:</p>
              <ul>
                <li>Your use of the Service</li>
                <li>Your content</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
              </ul>
            </section>

            <section id="disputes" class="section">
              <h2>13. Dispute Resolution</h2>
              
              <h3>Informal Resolution</h3>
              <p>Before filing a formal dispute, please contact us to attempt informal resolution. Many issues can be resolved quickly through direct communication.</p>

              <h3>Governing Law</h3>
              <p>These Terms are governed by the laws of the State of California, without regard to conflict of law principles.</p>

              <h3>Jurisdiction</h3>
              <p>Any disputes arising from these Terms will be resolved in the state or federal courts located in San Francisco County, California, and you consent to personal jurisdiction in these courts.</p>
            </section>

            <section id="changes" class="section">
              <h2>14. Changes to Terms</h2>
              <p>We may modify these Terms at any time. When we make material changes:</p>
              <ul>
                <li>We will update the "Last updated" date</li>
                <li>We will notify you via email or in-app notification</li>
                <li>Changes will take effect 30 days after notice</li>
              </ul>
              <p>Your continued use of the Service after changes take effect constitutes acceptance of the new Terms.</p>
            </section>

            <section id="contact" class="section">
              <h2>15. Contact Us</h2>
              <p>If you have questions about these Terms, please contact us:</p>
              <div class="contact-info">
                <p><strong>Email:</strong> <a href="mailto:legal@guardcloud.io">legal@guardcloud.io</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@guardcloud.io">support@guardcloud.io</a></p>
              </div>
              <NuxtLink to="/contact" class="btn btn-primary">Contact Us</NuxtLink>
            </section>

            <section class="section agreement-section">
              <div class="agreement-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <div>
                  <strong>By using GuardCloud, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
                </div>
              </div>
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
  max-height: calc(100vh - 120px);
  overflow-y: auto;
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

.section .btn-primary {
  background: var(--gc-primary);
  color: white;
  border: 1px solid var(--gc-primary);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.section .btn-primary:hover {
  background: var(--gc-primary-hover);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Agreement Box */
.agreement-section {
  border-bottom: none !important;
}

.agreement-box {
  display: flex;
  gap: 16px;
  align-items: center;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 24px;
}

.agreement-box svg {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  color: #10b981;
}

.agreement-box strong {
  color: var(--gc-text-primary);
  font-size: 15px;
  line-height: 1.6;
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
