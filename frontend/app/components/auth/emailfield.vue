<template>
  <div class="input-group">
    <div class="input-wrapper">
      <svg fill="none" viewBox="0 0 24 24" class="input-icon">
        <path stroke-width="1.5" stroke="currentColor" d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"></path>
      </svg>
      <input required = "" placeholder="Email" class="form-input" type="email" />
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
