/**
 * Auth middleware — redirects unauthenticated users to /login.
 * Pages with `auth: false` in definePageMeta are excluded.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  // Skip auth check for guest pages (login, register)
  if (to.meta.auth === false) {
    return
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
