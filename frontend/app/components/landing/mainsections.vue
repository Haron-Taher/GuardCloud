<script setup>
import img from '~/assets/logos/securecloud.png'
import logo from '~/assets/logos/securecloud.png'

const faqs =
[
  {
    q: 'What does “zero-knowledge” mean in GuardCloud?',
    a: 'Your files are encrypted on your device with per-file keys before upload. We can’t decrypt or read your content; access is controlled by the keys you hold or explicitly share.'
  },
  {
    q: 'How do encrypted shares work with external users?',
    a: 'We wrap the file key for each recipient (key-wrapping). Links can include expiry and passcodes. Recipients authenticate and decrypt locally; we never see their plaintext.'
  },
  {
    q: 'Can we use our own keys (BYOK)?',
    a: 'Yes. Use built-in client keys, platform passkeys, or integrate with your organization’s KMS/HSM. Admins can rotate keys and set escrow/backup policies.'
  },
  {
    q: 'What if a device is lost or ransomware strikes?',
    a: 'Remote sign-out invalidates tokens; keys can be rotated. Version history and recovery points let you restore clean copies. Optional anomaly detection flags unusual activity.'
  }
]
</script>

<template>
  <div>
    <section class="logos" aria-label="Trusted by">
      <div class="container">
        <p class="logos__label">Trusted by teams of all sizes</p>
        <div class="logos__grid">
          <img :src="logo" alt="Acme" />
          <img :src="logo" alt="Globex" />
          <img :src="logo" alt="Umbrella" />
          <img :src="logo" alt="Initech" />
          <img :src="logo" alt="Soylent" />
        </div>
      </div>
    </section>

    <section id="features" class="feature feature--alt">
      <div class="container feature__inner">
        <div class="feature__media">
          <img :src="img" alt="Smart summaries preview" />
        </div>

        <div class="feature__copy">
          <h2>Get answers — without exposing your data</h2>
          <p>Opt-in encrypted summaries and highlights for docs and PDFs. Keys never leave your device; your content is never used to train models.</p>
          <ul role="list" class="checklist">
            <li>On-device or private endpoint (opt-in)</li>
            <li>Inline citations to original text</li>
            <li>Respects org policies & zero-knowledge mode</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="feature">
      <div class="container feature__inner">
        <div class="feature__copy">
          <h2>Share confidently with end-to-end encryption</h2>
          <p>Invite teammates and partners with precise permissions. GuardCloud wraps file keys for each recipient so only intended people can decrypt.</p>
          <ul role="list" class="checklist">
            <li>E2EE links with expiry & passcodes</li>
            <li>Role-based access, approvals & audit logs</li>
            <li>File requests that encrypt on upload</li>
          </ul>
        </div>

        <div class="feature__media">
          <img :src="img" alt="Sharing and permissions UI" />
        </div>
      </div>
    </section>

    <section class="feature feature--alt">
      <div class="container feature__inner">
        <div class="feature__media">
          <img :src="img" class="video" alt="Offline preview" />
        </div>

        <div class="feature__copy">
          <h2>Fast sync, offline when you need it</h2>
          <p>Work anywhere with an encrypted local cache and smart, block-level sync that conserves bandwidth.</p>
          <ul role="list" class="checklist">
            <li>Offline access with encrypted cache</li>
            <li>Desktop Drive for macOS & Windows</li>
            <li>Version history & point-in-time restore</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="security" class="security">
      <div class="container security__inner">
        <div class="security__copy">
          <h2>Security that starts on your device</h2>
          <p>Per-file AES-256-GCM, modern key exchange, and strong authentication. Add DLP, anomaly detection, and retention controls as you scale.</p>
          <ul role="list" class="checklist">
            <li>Client-side encryption by default (AES-256-GCM)</li>
            <li>Key wrapping for recipients (RSA-4096 / ECDH)</li>
            <li>SSO/SAML, SCIM, DLP & retention policies</li>
          </ul>
        </div>

        <div class="security__card">
          <img :src="img" alt="Admin controls" />
        </div>
      </div>
    </section>

    <section id="pricing" class="cta">
      <div class="container cta__inner">
        <div class="cta__copy">
          <h2>Start free. Bring your own keys when you’re ready.</h2>
          <p>Use GuardCloud with personal keys today. Add SSO, BYOK/KMS integration, DLP, and advanced admin when your team grows.</p>
        </div>

        <div class="cta__actions">
          <NuxtLink class="btn btn--primary btn--lg" to="/signup">Create account</NuxtLink>
          <NuxtLink class="btn btn--ghost btn--lg" to="/contact">Talk to sales</NuxtLink>
        </div>
      </div>
    </section>

    <section id="faq" class="faq">
      <div class="container">
        <h2 class="faq__title">Frequently asked questions</h2>
        <div class="faq__grid">
          <details v-for="(item, i) in faqs" :key="i" :open="i === 0" class="faq__item">
            <summary>{{ item.q }}</summary>
            <p v-html="item.a" />
          </details>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.logos
{
  padding: 28px 0 8px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--card) 70%, transparent);
}

.logos__label
{
  color: var(--muted);
  text-align: center;
  margin: 0 0 14px;
  font-weight: 600;
}

.logos__grid
{
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 26px;
  align-items: center;
  justify-items: center;
  overflow: auto;
  padding-bottom: 10px;
}

.logos__grid img
{
  opacity: .7;
  filter: grayscale(100%);
  height: 26px;
}


.feature
{
  padding: clamp(48px, 8vw, 96px) 0;
}

.feature__inner
{
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: center;
}

@media (min-width: 940px)
{
  .feature__inner
  {
    grid-template-columns: 1fr 1fr;
    gap: 56px;
  }
}

.feature--alt .feature__inner
{
  direction: rtl;
}

.feature--alt .feature__copy
{
  direction: ltr;
}

.feature__copy h2
{
  font-size: clamp(24px, 3.2vw, 36px);
  margin: 0 0 10px;
}

.feature__copy p
{
  color: var(--muted);
  margin: 0 0 10px;
}

.feature__media img,
.security__card img
{
  width: 100%;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--card);
  box-shadow: 0 14px 28px color-mix(in srgb, black 20%, transparent);
}

.checklist
{
  display: grid;
  gap: 8px;
  margin: 14px 0 0;
  color: var(--text);
}

.checklist li
{
  list-style: none;
  padding-left: 26px;
  position: relative;
}

.checklist li::before
{
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 90%, #fff 10%);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
}


.security
{
  background: linear-gradient(180deg, color-mix(in srgb, var(--card) 70%, transparent), transparent);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.security__inner
{
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  align-items: center;
  padding: clamp(42px, 6vw, 72px) 0;
}

@media (min-width: 980px)
{
  .security__inner
  {
    grid-template-columns: 1.2fr .8fr;
    gap: 36px;
  }
}

.security__copy h2
{
  margin: 0 0 10px;
}

.security__copy p
{
  color: var(--muted);
  margin: 0 0 10px;
}


.cta
{
  padding: clamp(48px, 8vw, 96px) 0;
}

.cta__inner
{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: clamp(20px, 5vw, 32px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  align-items: center;
}

@media (min-width: 860px)
{
  .cta__inner
  {
    grid-template-columns: 1fr auto;
  }
}

.cta__copy h2
{
  margin: 0 0 8px;
}

.cta__copy p
{
  margin: 0;
  color: var(--muted);
}

.cta__actions
{
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}


.faq
{
  padding: clamp(40px, 6vw, 80px) 0;
  border-top: 1px solid var(--border);
}

.faq__title
{
  text-align: center;
  margin: 0 0 18px;
  font-size: clamp(24px, 3vw, 32px);
}

.faq__grid
{
  display: grid;
  gap: 10px;
  max-width: 860px;
  margin: 0 auto;
}

.faq__item
{
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  padding: 12px 16px;
}

.faq__item summary
{
  cursor: pointer;
  font-weight: 600;
}

.faq__item p
{
  color: var(--muted);
  margin: 8px 0 2px;
}
</style>
