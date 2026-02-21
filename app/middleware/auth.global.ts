/**
 * Auth middleware — redirects unauthenticated users to /login.
 * Pages with `auth: false` in definePageMeta are excluded.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, refresh } = useAuth()

  // Skip auth check for guest pages (login, register)
  if (to.meta.auth === false) {
    return
  }

  if (isAuthenticated.value) {
    return
  }

  const refreshed = await refresh()
  if (!refreshed) {
    return navigateTo('/login')
  }
})
