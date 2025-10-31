import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  srcDir: 'app',

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'], 
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },  
  runtimeConfig:
  {
    public:
    {
      apiBase:'http://127.0.0.1:8000',

      wsUrl: 'ws://127.0.0.1:8000/ws'
    }
  }

})