<script setup>
import NavPills from './navpills.vue'
import HeroSection from './herosection.vue'
import MainSections from './mainsections.vue'
import FooterBar from './footerbar.vue'
</script>

<template>
  <div class="page">
    <NavPills />
    <HeroSection />
    <MainSections />
    <FooterBar />
  </div>
</template>

<style>
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
}

.container
{
  width: min(1120px, 92vw);
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

.btn--lg
{
  padding: 14px 22px;
  border-radius: 12px;
  font-size: 1.05rem;
}
</style>
