import { ref, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>('system')
const isDark = ref(false)

export function useTheme() {
  // Initialize theme from localStorage
  function init() {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem('gc_theme') as Theme | null
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      theme.value = saved
    }

    updateTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateTheme)
  }

  // Update the actual theme
  function updateTheme() {
    if (typeof window === 'undefined') return

    let shouldBeDark = false

    if (theme.value === 'dark') {
      shouldBeDark = true
    } else if (theme.value === 'light') {
      shouldBeDark = false
    } else {
      // System preference
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    isDark.value = shouldBeDark

    if (shouldBeDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }

  // Set theme
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('gc_theme', newTheme)
    updateTheme()
  }

  // Toggle between light and dark
  function toggleTheme() {
    if (isDark.value) {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  // Watch for theme changes
  watch(theme, updateTheme)

  // Initialize on mount
  onMounted(init)

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    init,
  }
}
