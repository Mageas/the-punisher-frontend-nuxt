import type { ApiError, ApiErrorDetail, StudentImportRowError } from '~/types/api'

interface StudentImportRowErrorCandidate extends Record<string, unknown> {
  row: number
  field: string
  error?: string
  message?: string
  value?: string
  error_details?: string[]
}

function getImportErrorMessage(detail: Record<string, unknown>): string | null {
  if (typeof detail.error === 'string') {
    return detail.error
  }

  if (typeof detail.message === 'string') {
    return detail.message
  }

  return null
}

function hasValidErrorDetails(detail: StudentImportRowErrorCandidate): boolean {
  return (
    typeof detail.error_details === 'undefined' ||
    (Array.isArray(detail.error_details) &&
      detail.error_details.every((errorDetail) => typeof errorDetail === 'string'))
  )
}

function splitErrorKey(error: string): { key: string; value?: string } {
  const colonIndex = error.indexOf(':')

  if (colonIndex === -1) {
    return { key: error }
  }

  return {
    key: error.slice(0, colonIndex),
    value: error.slice(colonIndex + 1),
  }
}

function parseErrorDetails(errorDetails?: string[]): Record<string, string> {
  const context: Record<string, string> = {}

  if (!errorDetails) {
    return context
  }

  for (const errorDetail of errorDetails) {
    const colonIndex = errorDetail.indexOf(':')
    if (colonIndex <= 0) {
      continue
    }

    const key = errorDetail.slice(0, colonIndex).trim()
    const value = errorDetail.slice(colonIndex + 1).trim()

    if (key && value) {
      context[key] = value
    }
  }

  return context
}

function resolveImportContextValue(
  key: string,
  value: string,
  t: (key: string, params?: Record<string, unknown>) => string,
  te: (key: string) => boolean,
): string {
  if (key !== 'field' && key !== 'expected') {
    return value
  }

  const i18nKey = `apiErrors.importContext.${key}.${value}`
  if (te(i18nKey)) {
    return t(i18nKey)
  }

  return value
}

function formatImportErrorFallback(
  errorDetails: string[] | undefined,
  t: (key: string, params?: Record<string, unknown>) => string,
  te: (key: string) => boolean,
): string | null {
  if (!errorDetails || errorDetails.length === 0) {
    return null
  }

  const formattedDetails = errorDetails.map((errorDetail) => {
    const parsed = splitErrorKey(errorDetail)
    if (typeof parsed.value === 'undefined') {
      return parsed.key
    }

    const resolvedValue = resolveImportContextValue(parsed.key, parsed.value, t, te)
    return `${parsed.key}:${resolvedValue}`
  })

  return formattedDetails.join(', ')
}

interface StudentImportErrorMessageInput {
  error: string
  field: string
  value?: string
  error_details?: string[]
}

function buildStudentImportErrorContext(
  input: StudentImportErrorMessageInput,
  t: (key: string, params?: Record<string, unknown>) => string,
  te: (key: string) => boolean,
): { parsedError: { key: string; value?: string }; context: Record<string, unknown> } {
  const parsedError = splitErrorKey(input.error)
  const rawContext = parseErrorDetails(input.error_details)

  if (!rawContext.value) {
    if (parsedError.value) {
      rawContext.value = parsedError.value
    } else if (input.value) {
      rawContext.value = input.value
    }
  }

  if (!rawContext.field && input.field) {
    rawContext.field = input.field
  }

  const context = Object.fromEntries(
    Object.entries(rawContext).map(([key, value]) => [
      key,
      resolveImportContextValue(key, value, t, te),
    ]),
  )

  return { parsedError, context }
}

function getStudentImportErrorMessage(
  input: StudentImportErrorMessageInput,
  t: (key: string, params?: Record<string, unknown>) => string,
  te: (key: string) => boolean,
): string {
  const { parsedError, context } = buildStudentImportErrorContext(input, t, te)

  const i18nKey = `apiErrors.details.${parsedError.key}`
  if (te(i18nKey)) {
    return t(i18nKey, context)
  }

  const fallbackContext = formatImportErrorFallback(input.error_details, t, te)
  if (fallbackContext) {
    return `${input.error} (${fallbackContext})`
  }

  return input.error
}

export function isStudentImportRowError(detail: unknown): detail is StudentImportRowErrorCandidate {
  if (!detail || typeof detail !== 'object') {
    return false
  }

  const candidate = detail as StudentImportRowErrorCandidate

  return (
    typeof candidate.row === 'number' &&
    Number.isFinite(candidate.row) &&
    typeof candidate.field === 'string' &&
    getImportErrorMessage(candidate) !== null &&
    (typeof candidate.value === 'undefined' || typeof candidate.value === 'string') &&
    hasValidErrorDetails(candidate)
  )
}

export function extractStudentImportRowErrors(details?: unknown[]): StudentImportRowError[] {
  return (details ?? []).flatMap((detail) => {
    if (!isStudentImportRowError(detail)) {
      return []
    }

    const errorMessage = getImportErrorMessage(detail)
    if (!errorMessage) {
      return []
    }

    const rowError: StudentImportRowError = {
      row: detail.row,
      field: detail.field,
      error: errorMessage,
      value: detail.value,
    }

    if (detail.error_details) {
      rowError.error_details = detail.error_details
    }

    return [rowError]
  })
}

export function getStudentImportRowErrorMessage(
  rowError: StudentImportRowError,
  t: (key: string, params?: Record<string, unknown>) => string,
  te: (key: string) => boolean,
): string {
  return getStudentImportErrorMessage(rowError, t, te)
}

function isRowLevelImportDetail(detail: ApiErrorDetail): boolean {
  return typeof detail.row === 'number' && Number.isFinite(detail.row)
}

export function getStudentImportGlobalErrorMessage(
  apiError: Pick<ApiError, 'error' | 'error_details'>,
  t: (key: string, params?: Record<string, unknown>) => string,
  te: (key: string) => boolean,
): string {
  const topLevelI18nKey = `apiErrors.messages.${apiError.error}`
  const topLevelMessage = te(topLevelI18nKey)
    ? t(topLevelI18nKey)
    : t('apiErrors.messages.internal_error')

  const detailMessages = (apiError.error_details ?? [])
    .filter((detail) => !isRowLevelImportDetail(detail))
    .map((detail) => getStudentImportErrorMessage(detail, t, te))
    .filter((message, index, messages) => messages.indexOf(message) === index)

  if (detailMessages.length === 0) {
    return topLevelMessage
  }

  return `${topLevelMessage} ${detailMessages.join(' ')}`
}
