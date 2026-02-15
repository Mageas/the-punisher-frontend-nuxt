import { translateApiErrorKey } from "@/lib/api-error-i18n"

export type ApiErrorDetail = {
  field?: string
  error?: string
}

export type ApiErrorResponse = {
  error?: string
  error_code?: number
  error_details?: ApiErrorDetail[]
}

export type ParsedApiError = {
  code: string
  message: string
  statusCode: number | null
  fieldErrors: Record<string, string>
}

function getFallbackMessage(error: unknown): string {
  const defaultMessage = "Une erreur est survenue. Merci de reessayer."
  if (!error || typeof error !== "object") {
    return defaultMessage
  }

  const maybe = error as { statusMessage?: string; message?: string }
  if (maybe.statusMessage) {
    return maybe.statusMessage
  }
  if (maybe.message) {
    return maybe.message
  }
  return defaultMessage
}

function getStatusCode(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null
  }

  const maybe = error as { statusCode?: number; response?: { status?: number } }
  if (typeof maybe.statusCode === "number") {
    return maybe.statusCode
  }
  if (typeof maybe.response?.status === "number") {
    return maybe.response.status
  }
  return null
}

function getPayload(error: unknown): ApiErrorResponse | null {
  if (!error || typeof error !== "object") {
    return null
  }

  const maybe = error as { data?: unknown; response?: { _data?: unknown } }
  const rawPayload = maybe.data ?? maybe.response?._data

  if (!rawPayload || typeof rawPayload !== "object") {
    return null
  }

  return rawPayload as ApiErrorResponse
}

export function parseApiError(error: unknown): ParsedApiError {
  const statusCode = getStatusCode(error)
  const payload = getPayload(error)
  const fallbackMessage = getFallbackMessage(error)

  if (!payload) {
    return {
      code: "unknown_error",
      message: fallbackMessage,
      statusCode,
      fieldErrors: {},
    }
  }

  const fieldErrors: Record<string, string> = {}
  for (const detail of payload.error_details ?? []) {
    if (!detail?.field) {
      continue
    }
    fieldErrors[detail.field] = translateApiErrorKey(detail.error ?? "")
  }

  const code = payload.error ?? "unknown_error"
  const translatedMessage = translateApiErrorKey(code)

  return {
    code,
    message: translatedMessage || fallbackMessage,
    statusCode: typeof payload.error_code === "number" ? payload.error_code : statusCode,
    fieldErrors,
  }
}
