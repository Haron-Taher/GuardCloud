<template>
  <div class="form-footer">
    <NuxtLink to="/signup" class="login-link">
      Don’t have an account? <span>Sign Up</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
  .form-footer 
  { 
    margin-top: 16px; text-align: center; font-size: 13px; 
  }

  .login-link 
  { 
    color: var(--text-secondary); text-decoration: none; transition: all 0.2s ease; 
  }

  .login-link span 
  { 
    color: var(--primary); font-weight: 500; 
  }

  .login-link:hover 
  { 
    color: var(--text-main); 
  }

  .login-link:hover span 
  { 
    color: var(--primary-dark); 
  }
</style>
