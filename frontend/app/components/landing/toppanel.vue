<script setup>
import AboutStorageButton from '~/components/landing/aboutstoragebutton.vue';
import AboutSecurityButton from '~/components/landing/aboutsecuritybutton.vue';
import ToAuthButton from '~/components/landing/toauthbutton.vue'
</script>

<template>
  <div class="modern-form">
    <div class="form-title">
        CloudGuard
    </div>
    <AboutStorageButton />
    <AboutSecurityButton />
    <ToAuthButton />
</div>
</template>

<style scoped>
  .modern-form 
  {
    --primary: #3b82f6;
    --primary-dark: #2563eb;
    --primary-light: rgba(59, 130, 246, 0.1);
    --success: #10b981;
    --text-main: #1e293b;
    --text-secondary: #64748b;
    --bg-input: #f8fafc;

    display: flex;
    position: absolute;
    align-items: center;
    margin-top: 10px;
    width: 98%;
    height: 80px;
    top: 0;
    padding: 15px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.05),
      inset 0 0 0 1px rgba(148, 163, 184, 0.1);
    font-family: system-ui, -apple-system, sans-serif;
  }

  .form-title 
  {
    font-size: 30px; font-weight: 600; color: var(--text-main);
    margin: 0px 70px 0px; text-align: center; letter-spacing: -0.01em;
  }
</style>
