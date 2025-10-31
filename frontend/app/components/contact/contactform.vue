<template>
  <form class="card" @submit.prevent="handleSubmit">
    <h2>Send us a message</h2>

    <div class="row">
      <label for="name">Name</label>
      <input id="name" v-model.trim="form.name" type="text" required />
    </div>

    <div class="row">
      <label for="email">Email</label>
      <input id="email" v-model.trim="form.email" type="email" required />
    </div>

    <div class="row">
      <label for="subject">Subject</label>
      <input id="subject" v-model.trim="form.subject" type="text" required />
    </div>

    <div class="row">
      <label for="message">Message</label>
      <textarea id="message" v-model.trim="form.message" rows="6" required />
    </div>

    <div class="actions">
      <button class="btn btn--primary" type="submit" :disabled="sending">
        {{ sending ? 'Sending…' : 'Send message' }}
      </button>

      <p v-if="sent" class="sent">Thanks, we got your message.</p>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive(
{
  name: '',
  email: '',
  subject: '',
  message: ''
})

const sending = ref(false)
const sent = ref(false)

const handleSubmit = async () =>
{
  if (sending.value) return
  sending.value = true
  await new Promise(r => setTimeout(r, 650))
  sent.value = true
  sending.value = false
}
</script>

<style scoped>
.card
{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: clamp(16px, 3.4vw, 24px);
}

h2
{
  margin: 0 0 8px 0;
  font-size: clamp(18px, 2.5vw, 22px);
}

.row
{
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

label
{
  font-weight: 600;
}

input,
textarea
{
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
}

input:focus,
textarea:focus
{
  border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}

.actions
{
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
}

.sent
{
  color: var(--muted);
  font-weight: 600;
}
</style>
