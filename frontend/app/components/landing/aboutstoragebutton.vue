<template>
  <button class="storage-info-button" type="button">
    <span class="button-text">About storage</span>
  </button>
</template>

<style scoped>
  .storage-info-button
  {
    position: relative; width: 150px; height: 50px;
    color: var(--secondary);
    font-size: 18px; font-weight: 500; cursor: pointer; overflow: hidden; transition: all 0.2s ease;
  }

  .storage-info-button:hover 
  {
    color: var(--primary);
  }

  .storage-info-button:active 
  { 
    transform: translateY(0); box-shadow: none; 
  }
</style>
