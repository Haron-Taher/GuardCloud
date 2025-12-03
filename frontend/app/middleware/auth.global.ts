export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (!process.client) return

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard']
  
  // Auth routes (login, signup) - redirect to dashboard if logged in
  const authRoutes = ['/login', '/signup']
  
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
  const isAuthRoute = authRoutes.includes(to.path)
  
  // Get token from localStorage
  const token = localStorage.getItem('gc_token')
  const hasValidToken = !!token && token.length > 0
  
  // Protect authenticated routes
  if (isProtectedRoute && !hasValidToken) {
    // Preserve intended destination for redirect after login
    const redirectPath = to.fullPath !== '/dashboard' ? to.fullPath : undefined
    return navigateTo({
      path: '/login',
      query: redirectPath ? { redirect: redirectPath } : undefined,
    })
  }
  
  // Redirect logged-in users away from auth pages
  if (isAuthRoute && hasValidToken) {
    // Check if there's a redirect query param
    const redirect = to.query.redirect as string | undefined
    return navigateTo(redirect || '/dashboard')
  }
})
