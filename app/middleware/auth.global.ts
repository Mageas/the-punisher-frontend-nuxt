export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const auth = useAuth()

  const isPublicAuthRoute = to.path === "/login" || to.path === "/register"

  if (!auth.isAuthenticated.value && !isPublicAuthRoute) {
    return navigateTo("/login")
  }

  if (auth.isAuthenticated.value && isPublicAuthRoute) {
    return navigateTo("/")
  }
})
