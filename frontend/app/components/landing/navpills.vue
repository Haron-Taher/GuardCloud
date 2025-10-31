<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import logo from '~/assets/logos/securecloud.png'

const ids =
[
  'overview',
  'features',
  'security',
  'pricing',
  'faq'
]

const labels: Record<string, string> =
{
  overview: 'Overview',
  features: 'Features',
  security: 'Security',
  pricing: 'Pricing',
  faq: 'FAQs'
}

const nav = ids.map((id) => ({ id, label: labels[id] || id }))

const root = ref<HTMLElement | null>(null)
const current = ref('overview')

let spy: IntersectionObserver | null = null

const setOffset = () =>
{
  const h = root.value?.offsetHeight ?? 84
  document.documentElement.style.setProperty('--subnav-h', `${h}px`)
}

const onScroll = () =>
{
  const header = root.value?.closest('header') as HTMLElement | null
  if (!header || !root.value) return
  const rect = header.getBoundingClientRect()
  if (rect.bottom <= 0) root.value.classList.add('stuck')
  else root.value.classList.remove('stuck')
  setOffset()
}

onMounted(() =>
{
  const targets = ids
    .map((id) => document.getElementById(id))
    .filter(Boolean) as HTMLElement[]

  spy = new IntersectionObserver(
    (entries) =>
    {
      entries.forEach((e) =>
      {
        if (e.isIntersecting) current.value = e.target.id
      })
    },
    { rootMargin: '-48% 0px -48% 0px', threshold: 0 }
  )

  targets.forEach((t) => spy!.observe(t))

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', setOffset)
  setOffset()
})

onBeforeUnmount(() =>
{
  spy?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', setOffset)
})

watchEffect(() =>
{
  const pills = root.value?.querySelectorAll('.pill') ?? []
  pills.forEach((a: Element) =>
  {
    const id = (a as HTMLAnchorElement).getAttribute('href')?.slice(1)
    const active = id === current.value
    a.classList.toggle('is-active', active)
    if (active) (a as HTMLAnchorElement).setAttribute('aria-current', 'page')
    else (a as HTMLAnchorElement).removeAttribute('aria-current')
  })
})
</script>

<template>
  <header class="nav">
    <div class="container nav__inner">
      <a class="brand" href="#">
        <img :src="logo" width="28" height="28" alt="GuardCloud logo" />
        <span>GuardCloud</span>
      </a>

      <div ref="root" class="subnav" aria-label="Page sections" role="navigation">
        <div class="subnav__tray">
          <a
            v-for="l in nav"
            :key="l.id"
            :href="`#${l.id}`"
            class="pill"
            :aria-current="l.id === current ? 'page' : null"
          >
            {{ l.label }}
          </a>
        </div>
      </div>

      <div class="actions">
        <NuxtLink class="btn btn--ghost" to="/login">Sign in</NuxtLink>
        <NuxtLink class="btn btn--primary" to="/signup">Get started</NuxtLink>
      </div>
    </div>
  </header>
</template>


<style scoped>
.nav
{
  position: static;
  z-index: 10;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.nav__inner
{
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.brand
{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  text-decoration: none;
  color: inherit;
}

.actions
{
  display: none;
  gap: 10px;
}

@media (min-width: 880px)
{
  .actions
  {
    display: flex;
  }
}


.subnav
{
  justify-self: center;
}

.subnav__tray
{
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: 9999px;
  box-shadow: 0 8px 20px color-mix(in srgb, black 10%, transparent);
  max-width: min(980px, 92vw);
  overflow-x: auto;
}

.pill
{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 9999px;
  color: var(--muted);
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

.pill:hover
{
  background: color-mix(in srgb, var(--card) 80%, transparent);
  color: var(--text);
}

.pill[aria-current="page"],
.pill.is-active
{
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--text);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--border));
}

.subnav.stuck
{
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  z-index: 60;
  padding: 10px 0;
  backdrop-filter: saturate(180%) blur(6px);
}

.subnav.stuck .subnav__tray
{
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  border-color: var(--border);
}

:global(html)
{
  scroll-behavior: smooth;
}

:global(section[id])
{
  scroll-margin-top: var(--subnav-h, 84px);
}
</style>
