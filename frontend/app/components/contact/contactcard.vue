<template>
  <div class="page">
    <TopBar />

    <section class="hero">
      <div class="container">
        <h1>Contact GuardCloud</h1>
        <p class="lead">
          Reach our team for support, security reviews, or sales. We usually reply within one business day.
        </p>
      </div>
    </section>

    <section class="contact">
      <div class="container contact__grid">
        <ContactForm />

        <ContactInfo />
      </div>
    </section>
  </div>
</template>

<script setup>
import TopBar from '~/components/shared/topBar.vue'
import ContactForm from './contactform.vue'
import ContactInfo from './contactinfo.vue'
</script>

<style scoped>
.page
{
  --bg: #ffffff;
  --text: #0b1220;
  --muted: #5b6b7a;
  --card: #f5f7fb;
  --border: #e6e9ef;
  --accent: #0b57d0;
}

@media (prefers-color-scheme: dark)
{
  .page
  {
    --bg: #0b0d11;
    --text: #e7ebf3;
    --muted: #9aa3af;
    --card: #121720;
    --border: #1e2532;
    --accent: #8ab4ff;
  }
}

.page
{
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

.container
{
  width: min(960px, 92vw);
  margin-inline: auto;
}

.btn
{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  font-weight: 600;
  text-decoration: none;
  transition: transform .06s ease, background .2s ease, border-color .2s ease;
}

.btn:active
{
  transform: translateY(1px);
}

.btn--primary
{
  background: var(--accent);
  color: #fff;
  border-color: color-mix(in srgb, var(--accent) 70%, black 10%);
}

.btn--primary:hover
{
  filter: brightness(1.05);
}

.btn--ghost
{
  background: transparent;
  color: var(--text);
}

.hero
{
  padding: clamp(32px, 6vw, 64px) 0 12px 0;
}

.hero h1
{
  font-size: clamp(28px, 4.2vw, 44px);
  letter-spacing: -0.01em;
  margin: 0 0 10px 0;
}

.lead
{
  color: var(--muted);
  margin: 0;
  max-width: 60ch;
}

.contact
{
  padding: clamp(18px, 3vw, 26px) 0 clamp(40px, 6vw, 80px) 0;
}

.contact__grid
{
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr;
}

@media (min-width: 980px)
{
  .contact__grid
  {
    grid-template-columns: 1.1fr .9fr;
    gap: 28px;
  }
}
</style>
