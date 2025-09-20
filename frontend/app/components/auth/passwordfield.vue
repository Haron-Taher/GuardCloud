<template>
  <div class="input-group">
    <div class="input-wrapper">
      <svg fill="none" viewBox="0 0 24 24" class="input-icon">
        <path stroke-width="1.5" stroke="currentColor" d="M12 10V14M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6Z"></path>
      </svg>
      <input required="" placeholder="Password" class="form-input" type="password" />
      <button class="password-toggle" type="button">
        <svg fill="none" viewBox="0 0 24 24" class="eye-icon">
          <path stroke-width="1.5" stroke="currentColor" d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"></path>
          <circle stroke-width="1.5" stroke="currentColor" r="3" cy="12" cx="12"></circle>
        </svg>
      </button>
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

  .password-toggle 
  {
    position: absolute; right: 12px; display: flex; align-items: center;
    padding: 4px; background: none; border: none; color: var(--text-secondary);
    cursor: pointer; transition: all 0.2s ease;
  }

  .eye-icon 
  { 
    width: 16px; height: 16px; 
  }

  .form-input:hover 
  { 
    border-color: #cbd5e1; 
  }

  .form-input:focus 
  {
    outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px var(--primary-light);
  }

  .password-toggle:hover 
  { 
    color: var(--primary); transform: scale(1.1); 
  }

  .submit-button:active 
  { 
    transform: translateY(0); box-shadow: none; 
  }

  .password-toggle:active 
  { 
    transform: scale(0.9); 
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
