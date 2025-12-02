export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (!process.client) return

  // Protected routes
  const protectedRoutes = ['/dashboard']
  
  // Check if route is protected
  const isProtected = protectedRoutes.some(route => to.path.startsWith(route))
  
  if (isProtected) {
    const token = localStorage.getItem('gc_token')
    
    if (!token) {
      return navigateTo('/login')
    }
  }
  
  // Redirect logged in users away from auth pages
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(to.path)
  
  if (isAuthRoute) {
    const token = localStorage.getItem('gc_token')
    
    if (token) {
      return navigateTo('/dashboard')
    }
  }
})
