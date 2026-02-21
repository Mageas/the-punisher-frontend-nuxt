/**
 * Auth middleware — redirects unauthenticated users to /login.
 * Pages with `auth: false` in definePageMeta are excluded.
 */
function isTokenExpired(token: string): boolean {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return true

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const json = import.meta.server ? Buffer.from(padded, 'base64').toString('utf-8') : atob(padded)
    const payload = JSON.parse(json) as { exp?: number }

    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 <= Date.now() + 5_000
  } catch {
    return true
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const accessToken = useState<string | null>('auth.access-token', () => null)
  const accessTokenCookie = useCookie<string | null>('access_token', {
    path: '/',
    sameSite: 'lax',
  })
  const { isAuthenticated, refresh } = useAuth()

  // Skip auth check for guest pages (login, register)
  if (to.meta.auth === false) {
    return
  }

  // On SSR, rebuild in-memory auth state from access token cookie if present.
  if (import.meta.server && !accessToken.value) {
    accessToken.value = accessTokenCookie.value
  }

  if (accessToken.value && isTokenExpired(accessToken.value)) {
    accessToken.value = null
    accessTokenCookie.value = null
  }

  if (isAuthenticated.value) {
    return
  }

  // SSR cannot reliably use refresh_token (cookie is usually scoped to /auth/refresh).
  if (import.meta.server) {
    return navigateTo('/login')
  }

  const refreshed = await refresh()
  if (!refreshed) {
    return navigateTo('/login')
  }
})
