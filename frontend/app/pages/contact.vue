<script setup lang="ts">
import { ref, reactive } from 'vue'
import { GcButton, GcInput, GcCard } from '~/components/ui'

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const sending = ref(false)
const sent = ref(false)

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
          <img src="~/assets/logos/securecloud.png" width="28" height="28" alt="GuardCloud" />
          <span>GuardCloud</span>
        </NuxtLink>
        <div class="nav__actions">
          <GcButton to="/login" variant="ghost">Sign in</GcButton>
          <GcButton to="/signup" variant="primary">Get started</GcButton>
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
        <GcCard variant="elevated" class="contact-form">
          <h2>Send us a message</h2>
          
          <form v-if="!sent" @submit.prevent="handleSubmit" class="form">
            <GcInput
              v-model="form.name"
              label="Name"
              placeholder="Your name"
              required
            />
            
            <GcInput
              v-model="form.email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              required
            />
            
            <GcInput
              v-model="form.subject"
              label="Subject"
              placeholder="How can we help?"
              required
            />
            
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea
                v-model="form.message"
                placeholder="Tell us more..."
                rows="5"
                required
              ></textarea>
            </div>
            
            <GcButton type="submit" variant="primary" :loading="sending">
              Send message
            </GcButton>
          </form>

          <div v-else class="success">
            <span class="success__icon">✓</span>
            <h3>Message sent!</h3>
            <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
            <GcButton variant="ghost" @click="sent = false">Send another</GcButton>
          </div>
        </GcCard>

        <!-- Info -->
        <div class="contact-info">
          <GcCard class="info-card">
            <div class="info-card__header">
              <img src="~/assets/logos/securecloud.png" width="32" height="32" alt="" />
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
          </GcCard>

          <GcCard class="info-card">
            <h4>Looking for documentation?</h4>
            <p>Check out our help center for guides, tutorials, and FAQs.</p>
            <GcButton to="#" variant="outline" size="sm">Visit Help Center</GcButton>
          </GcCard>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--gc-bg);
  color: var(--gc-text);
}

.container {
  width: min(1100px, 92vw);
  margin-inline: auto;
}

/* Nav */
.nav {
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
  color: var(--gc-text);
  text-decoration: none;
}

.nav__actions {
  display: flex;
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
}

.hero p {
  font-size: 18px;
  color: var(--gc-text-muted);
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
  padding: 32px;
}

.contact-form h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-weight: 600;
  font-size: 14px;
}

textarea {
  width: 100%;
  padding: 12px 14px;
  background: var(--gc-bg-subtle);
  color: var(--gc-text);
  border: 1px solid var(--gc-border);
  border-radius: var(--gc-radius-md);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: all 0.15s;
}

textarea:focus {
  border-color: var(--gc-accent);
  box-shadow: 0 0 0 3px var(--gc-accent-light);
}

textarea::placeholder {
  color: var(--gc-text-muted);
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
  width: 56px;
  height: 56px;
  background: var(--gc-success);
  color: #fff;
  border-radius: 50%;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.success h3 {
  font-size: 20px;
  margin: 0 0 8px;
}

.success p {
  color: var(--gc-text-muted);
  margin: 0 0 20px;
}

/* Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  padding: 24px;
}

.info-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.info-card__header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.info-card__header p {
  font-size: 13px;
  color: var(--gc-text-muted);
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
}

.info-list__label {
  font-weight: 600;
  color: var(--gc-text-muted);
}

.info-list a {
  color: var(--gc-accent);
  text-decoration: none;
}

.info-list a:hover {
  text-decoration: underline;
}

.info-card h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px;
}

.info-card > p {
  font-size: 14px;
  color: var(--gc-text-muted);
  margin: 0 0 16px;
}
</style>
