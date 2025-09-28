<template>
  <button class="security-info-button" type="button">
    <span class="button-text">About security</span>
  </button>
</template>

<style scoped>
  .security-info-button
  {
    position: relative; width: 150px; height: 50px;
    color: var(--secondary);
    font-size: 18px; font-weight: 500; cursor: pointer; overflow: hidden; transition: all 0.2s ease;
  }

  .security-info-button:hover 
  {
    color: var(--primary);
  }

  .security-info-button:active 
  { 
    transform: translateY(0); box-shadow: none; 
  }
</style>
