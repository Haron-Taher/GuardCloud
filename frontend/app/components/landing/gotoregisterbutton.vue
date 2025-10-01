<template>
    <NuxtLink to=/login class="goto-register-button">
        <button class="goto-register-button" type="button">
            <span class="button-text">Log In</span>
            <div class="button-glow"></div>
        </button>
    </NuxtLink>
</template>

<style scoped>
  .goto-register-button
  {
    position: relative; width: 150px; height: 40px; margin-left: auto;
    background: var(--primary); color: white; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 500; cursor: pointer; overflow: hidden; transition: all 0.2s ease;
  }

  .button-glow 
  {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: translateX(-100%); transition: transform 0.5s ease;
  }

  .goto-register-button:hover 
  {
    background: var(--primary-dark); transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25), 0 2px 4px rgba(59, 130, 246, 0.15);
  }

  .goto-register-button:hover .button-glow 
  { 
    transform: translateX(100%); 
  }

  .goto-register-button:active 
  { 
    transform: translateY(0); box-shadow: none; 
  }
</style>
