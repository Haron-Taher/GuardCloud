<template>
  <aside class="info card">
    <div class="head">
      <img :src="logo" width="28" height="28" alt="GuardCloud" />
      <div class="title">
        <h3>Get in touch</h3>
        <p>We’re here to help</p>
      </div>
    </div>

    <ul class="list" role="list">
      <li>
        <strong>Email</strong>
        <a href="mailto:support@guardcloud.example">support@guardcloud.example</a>
      </li>

      <li>
        <strong>Sales</strong>
        <a href="mailto:sales@guardcloud.example">sales@guardcloud.example</a>
      </li>

      <li>
        <strong>Status</strong>
        <a href="#" aria-disabled="true">status.guardcloud.example</a>
      </li>

      <li>
        <strong>Hours</strong>
        <span>Mon–Fri, 9am–6pm PT</span>
      </li>

      <li>
        <strong>SLA</strong>
        <span>Priority support for paid plans</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import logo from '~/assets/logos/securecloud.png'
</script>

<style scoped>
.card
{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: clamp(16px, 3.4vw, 24px);
}

.head
{
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 12px;
  align-items: center;
}

.title h3
{
  margin: 0;
  font-size: 18px;
}

.title p
{
  margin: 2px 0 0 0;
  color: var(--muted);
}

.list
{
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.list li
{
  list-style: none;
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px;
  align-items: baseline;
}

.list a
{
  color: var(--text);
  text-decoration: none;
  border-bottom: 1px dashed color-mix(in srgb, var(--text) 50%, transparent);
}

.list a:hover
{
  color: var(--accent);
  border-bottom-color: color-mix(in srgb, var(--accent) 60%, transparent);
}
</style>
