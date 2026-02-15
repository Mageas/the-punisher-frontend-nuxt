import { parseApiError } from "@/lib/api-error"

type AuthApiSuccess = {
  access_token: string
}

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  email: string
  password: string
  first_name: string
  last_name: string
}

const LOGGED_OUT_STORAGE_KEY = "tp.logged-out"

export function useAuth() {
  const config = useRuntimeConfig()
  const accessToken = useState<string | null>("auth.access-token", () => null)
  const initialized = useState<boolean>("auth.initialized", () => false)
  const initInFlight = useState<Promise<void> | null>("auth.init-in-flight", () => null)
  const loading = useState<boolean>("auth.loading", () => false)
  const lastError = useState<string | null>("auth.last-error", () => null)
  const fieldErrors = useState<Record<string, string>>("auth.field-errors", () => ({}))
  const loggedOutMarker = useCookie<string>("tp.logged-out", {
    path: "/",
    sameSite: "lax",
    default: () => "0",
  })

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  const requestAuth = async (
    endpoint: "/auth/login" | "/auth/refresh",
    options?: { body?: Record<string, unknown> },
  ) => {
    const forwardedCookieHeaders = import.meta.server ? useRequestHeaders(["cookie"]) : undefined

    const response = await $fetch<AuthApiSuccess>(`${config.public.apiBaseUrl}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: forwardedCookieHeaders,
      body: options?.body,
    })

    if (!response?.access_token) {
      throw new Error("access_token_missing")
    }

    accessToken.value = response.access_token
    return response
  }

  const setLoggedOutMarker = (isLoggedOut: boolean) => {
    const value = isLoggedOut ? "1" : "0"
    loggedOutMarker.value = value
    if (import.meta.client) {
      window.localStorage.setItem(LOGGED_OUT_STORAGE_KEY, value)
    }
  }

  const isLoggedOutMarked = () => {
    if (loggedOutMarker.value === "1") {
      return true
    }

    if (import.meta.client) {
      return window.localStorage.getItem(LOGGED_OUT_STORAGE_KEY) === "1"
    }

    return false
  }

  const clearErrors = () => {
    lastError.value = null
    fieldErrors.value = {}
  }

  const applyApiError = (error: unknown) => {
    const parsed = parseApiError(error)
    fieldErrors.value = parsed.fieldErrors
    lastError.value = parsed.message
  }

  const login = async (payload: LoginPayload) => {
    loading.value = true
    clearErrors()
    try {
      await requestAuth("/auth/login", { body: payload })
      setLoggedOutMarker(false)
      initialized.value = true
    } catch (error) {
      accessToken.value = null
      applyApiError(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const register = async (payload: RegisterPayload) => {
    loading.value = true
    clearErrors()
    try {
      const forwardedCookieHeaders = import.meta.server ? useRequestHeaders(["cookie"]) : undefined
      await $fetch(`${config.public.apiBaseUrl}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: forwardedCookieHeaders,
        body: payload,
      })

      // Register success should return to login screen, not auto-authenticate.
      accessToken.value = null
      setLoggedOutMarker(true)
      initialized.value = true
    } catch (error) {
      accessToken.value = null
      applyApiError(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => {
    try {
      await requestAuth("/auth/refresh", { body: {} })
      setLoggedOutMarker(false)
      return true
    } catch {
      accessToken.value = null
      return false
    }
  }

  const init = async () => {
    if (initialized.value) {
      return
    }

    if (isLoggedOutMarked() && !accessToken.value) {
      initialized.value = true
      return
    }

    if (initInFlight.value) {
      await initInFlight.value
      return
    }

    initInFlight.value = (async () => {
      await refresh()
      initialized.value = true
      initInFlight.value = null
    })()

    await initInFlight.value
  }

  const logout = async () => {
    setLoggedOutMarker(true)

    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // Client-side logout still continues even if server cleanup fails.
    }

    accessToken.value = null
    clearErrors()
    initialized.value = true

    await navigateTo("/login")
  }

  return {
    accessToken,
    initialized,
    loading,
    lastError,
    fieldErrors,
    isAuthenticated,
    clearErrors,
    login,
    register,
    refresh,
    init,
    logout,
  }
}
