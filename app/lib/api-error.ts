import type { ApiError } from '~/types/api'

interface ApiFetchErrorLike {
  status?: unknown
  statusCode?: unknown
  response?: {
    status?: unknown
  }
  message?: unknown
  name?: unknown
  cause?: unknown
}

function toErrorMessage(value: unknown): string | null {
  if (typeof value === 'string') return value

  if (value && typeof value === 'object' && 'message' in value) {
    const message = (value as { message?: unknown }).message
    return typeof message === 'string' ? message : null
  }

  return null
}

export function getApiErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined

  const e = error as ApiFetchErrorLike
  const candidates = [e.status, e.statusCode, e.response?.status]

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate
    }
  }

  return undefined
}

export function extractApiError(error: unknown): ApiError | null {
  if (!error || typeof error !== 'object') return null

  if ('data' in error) {
    const data = (error as { data: unknown }).data
    if (data && typeof data === 'object' && 'error' in data) {
      return data as ApiError
    }
  }

  if ('error' in error && 'error_code' in error) {
    return error as ApiError
  }

  return null
}

export function isNetworkApiError(error: unknown): boolean {
  if (getApiErrorStatus(error) !== undefined) {
    return false
  }

  if (error instanceof TypeError) {
    return true
  }

  if (!error || typeof error !== 'object') {
    return false
  }

  const e = error as ApiFetchErrorLike
  const message = toErrorMessage(e.message)?.toLowerCase() || ''
  const causeMessage = toErrorMessage(e.cause)?.toLowerCase() || ''
  const name = typeof e.name === 'string' ? e.name.toLowerCase() : ''

  return (
    name.includes('fetcherror') ||
    message.includes('failed to fetch') ||
    message.includes('fetch failed') ||
    message.includes('networkerror') ||
    message.includes('network error') ||
    message.includes('load failed') ||
    message.includes('cors') ||
    causeMessage.includes('failed to fetch') ||
    causeMessage.includes('fetch failed') ||
    causeMessage.includes('network') ||
    causeMessage.includes('cors')
  )
}

export function isFatalApiError(error: unknown): boolean {
  const status = getApiErrorStatus(error)

  if (typeof status === 'number' && status >= 500) {
    return true
  }

  return isNetworkApiError(error)
}
