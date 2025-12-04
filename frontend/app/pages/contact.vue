<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleTheme, init: initTheme } = useTheme()

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const sending = ref(false)
const sent = ref(false)

onMounted(() => {
  initTheme()
})

const handleSubmit = async () => {
  if (sending.value) return
  sending.value = true
  
  // Simulate API call
  await new Promise(r => setTimeout(r, 800))
  
  sent.value = true
  sending.value = false
}
</script>

<template>
  <div class="contact-page">
    <!-- Navigation -->
    <header class="nav">
      <div class="container nav__inner">
        <NuxtLink to="/" class="brand">
          <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"/>
          </svg>
          <span>GuardCloud</span>
        </NuxtLink>
        <div class="nav__actions">
          <button class="theme-btn" @click="toggleTheme">
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
      <div class="container">
        <h1>Contact Us</h1>
        <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>
    </section>

    <!-- Content -->
    <section class="content">
      <div class="container content__grid">
        <!-- Form -->
        <div class="contact-form">
          <h2>Send us a message</h2>
          
          <form v-if="!sent" @submit.prevent="handleSubmit" class="form">
            <div class="form-group">
              <label for="name">Name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Your name"
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="you@example.com"
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="subject">Subject</label>
              <input
                id="subject"
                v-model="form.subject"
                type="text"
                placeholder="How can we help?"
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="message">Message</label>
              <textarea
                id="message"
                v-model="form.message"
                placeholder="Tell us more..."
                rows="5"
                required
                class="form-textarea"
              ></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary btn-lg" :disabled="sending">
              <span v-if="sending" class="spinner"></span>
              {{ sending ? 'Sending...' : 'Send message' }}
            </button>
          </form>

          <div v-else class="success">
            <span class="success__icon">✓</span>
            <h3>Message sent!</h3>
            <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
            <button class="btn btn-ghost" @click="sent = false">Send another</button>
          </div>
        </div>

        <!-- Info -->
        <div class="contact-info">
          <div class="info-card">
            <div class="info-card__header">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"/>
              </svg>
              <div>
                <h3>GuardCloud Support</h3>
                <p>We're here to help</p>
              </div>
            </div>
            
            <ul class="info-list">
              <li>
                <span class="info-list__label">Email</span>
                <a href="mailto:support@guardcloud.io">support@guardcloud.io</a>
              </li>
              <li>
                <span class="info-list__label">Sales</span>
                <a href="mailto:sales@guardcloud.io">sales@guardcloud.io</a>
              </li>
              <li>
                <span class="info-list__label">Hours</span>
                <span>Mon–Fri, 9am–6pm PT</span>
              </li>
              <li>
                <span class="info-list__label">Response</span>
                <span>Within 24 hours</span>
              </li>
            </ul>
          </div>

          <div class="info-card">
            <h4>Looking for documentation?</h4>
            <p>Check out our help center for guides, tutorials, and FAQs.</p>
            <button class="btn btn-ghost btn-sm">Visit Help Center</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
}

.container {
  width: min(1100px, 92vw);
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

.btn-primary:hover:not(:disabled) {
  background: var(--gc-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: var(--gc-text-primary);
  border-color: var(--gc-border);
}

.btn-ghost:hover {
  background: var(--gc-bg-tertiary);
}

.btn-lg {
  padding: 14px 28px;
  font-size: 16px;
  width: 100%;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
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

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.brand-icon {
  width: 28px;
  height: 28px;
  color: var(--gc-primary);
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

.hero h1 {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  margin: 0 0 12px;
  color: var(--gc-text-primary);
}

.hero p {
  font-size: 18px;
  color: var(--gc-text-secondary);
  margin: 0;
  max-width: 560px;
}

/* Content */
.content {
  padding-bottom: clamp(48px, 8vw, 96px);
}

.content__grid {
  display: grid;
  gap: 24px;
}

@media (min-width: 900px) {
  .content__grid {
    grid-template-columns: 1.2fr 0.8fr;
    gap: 32px;
  }
}

/* Form */
.contact-form {
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--gc-shadow-lg);
}

.contact-form h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px;
  color: var(--gc-text-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
  color: var(--gc-text-primary);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: var(--gc-bg-primary);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--gc-text-secondary);
}

/* Success */
.success {
  text-align: center;
  padding: 32px 0;
}

.success__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--gc-success);
  color: #fff;
  border-radius: 50%;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
}

.success h3 {
  font-size: 22px;
  margin: 0 0 8px;
  color: var(--gc-text-primary);
}

.success p {
  color: var(--gc-text-secondary);
  margin: 0 0 20px;
}

/* Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  padding: 24px;
}

.info-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.info-icon {
  width: 32px;
  height: 32px;
  color: var(--gc-primary);
}

.info-card__header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--gc-text-primary);
}

.info-card__header p {
  font-size: 13px;
  color: var(--gc-text-secondary);
  margin: 0;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--gc-text-primary);
}

.info-list__label {
  font-weight: 600;
  color: var(--gc-text-secondary);
}

.info-list a {
  color: var(--gc-primary);
  text-decoration: none;
}

.info-list a:hover {
  text-decoration: underline;
}

.info-card h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--gc-text-primary);
}

.info-card > p {
  font-size: 14px;
  color: var(--gc-text-secondary);
  margin: 0 0 16px;
}
</style>
