import { setCookie } from "h3"

const REFRESH_TOKEN_COOKIE_NAME = "refresh_token"
const REFRESH_TOKEN_POSSIBLE_PATHS = ["/", "/v1", "/v1/auth"]

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  for (const path of REFRESH_TOKEN_POSSIBLE_PATHS) {
    setCookie(event, REFRESH_TOKEN_COOKIE_NAME, "", {
      path,
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
      httpOnly: true,
    })
    setCookie(event, REFRESH_TOKEN_COOKIE_NAME, "", {
      path,
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
    })
  }

  // Backend logout is optional in current API contract.
  try {
    await $fetch(`${config.public.apiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: useRequestHeaders(["cookie"]),
    })
  } catch {
    // Ignore if backend endpoint is not available.
  }

  return { success: true }
})
