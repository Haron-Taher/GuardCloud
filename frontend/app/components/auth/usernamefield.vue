<template>
  <div class="input-group">
    <div class="input-wrapper">
      <svg fill="none" viewBox="0 0 24 24" class="input-icon">
        <circle stroke-width="1.5" stroke="currentColor" r="4" cy="8" cx="12"></circle>
        <path stroke-linecap="round" stroke-width="1.5" stroke="currentColor" d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20"></path>
      </svg>
      <input required="" placeholder="Username" class="form-input" type="text" />
    </div>
  </div>
</template>

<style scoped>
  .input-group 
  { 
    margin-bottom: 16px; 
  }

  .input-wrapper 
  { 
    position: relative; display: flex; align-items: center; 
  }

  .form-input 
  {
    width: 100%; height: 40px; padding: 0 36px; font-size: 14px;
    border: 1px solid #e2e8f0; border-radius: 10px; background: var(--bg-input);
    color: var(--text-main); transition: all 0.2s ease;
  }

  .form-input::placeholder 
  { 
    color: var(--text-secondary); 
  }

  .input-icon 
  {
    position: absolute; left: 12px; width: 16px; height: 16px;
    color: var(--text-secondary); pointer-events: none;
  }

  .form-input:hover 
  { 
    border-color: #cbd5e1; 
  }

  .form-input:focus 
  {
    outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px var(--primary-light);
  }

  .form-input:not(:placeholder-shown):valid 
  { 
    border-color: var(--success); 
  }

  .form-input:not(:placeholder-shown):valid ~ .input-icon 
  { 
    color: var(--success); 
  }

  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }

  .form-input:not(:placeholder-shown):invalid 
  { 
    border-color:#ef4444; animation: shake 0.2s ease-in-out; 
  }

  .form-input:not(:placeholder-shown):invalid ~ .input-icon 
  { 
    color: #ef4444; 
  }
</style>
