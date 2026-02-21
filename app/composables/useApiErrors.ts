import type { ApiError, ApiErrorDetail } from '~/types/api'

/**
 * Parsed field errors: maps field names to their translated error messages.
 */
export type FieldErrors = Record<string, string>

/**
 * Parses an API error detail entry (e.g. "validation_min_length:8")
 * into an i18n key and an optional parameter value.
 */
function parseDetailError(error: string): { key: string; value?: string } {
  const colonIndex = error.indexOf(':')
  if (colonIndex === -1) {
    return { key: error }
  }
  return {
    key: error.substring(0, colonIndex),
    value: error.substring(colonIndex + 1),
  }
}

/**
 * Composable to manage API error responses with field-level validation.
 *
 * Parses `error_details` from the API and returns translated messages
 * mapped to their respective field names, ready to display under form inputs.
 *
 * @example
 * ```vue
 * const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()
 *
 * try {
 *   await $fetch('/auth/login', { method: 'POST', body: form })
 * } catch (err) {
 *   handleApiError(err)
 * }
 *
 * // In template:
 * // <p v-if="fieldErrors.email">{{ fieldErrors.email }}</p>
 * // <p v-if="globalError">{{ globalError }}</p>
 * ```
 */
export function useApiErrors() {
  const { t, te } = useI18n()

  const fieldErrors = ref<FieldErrors>({})
  const globalError = ref<string | null>(null)

  /**
   * Translates a single error detail into a human-readable message.
   */
  function translateDetail(detail: ApiErrorDetail): string {
    const { key, value } = parseDetailError(detail.error)
    const i18nKey = `apiErrors.details.${key}`

    if (te(i18nKey)) {
      return t(i18nKey, { value: value ?? '' })
    }

    // Fallback: use the generic validation_error key with the raw error
    return t('apiErrors.details.validation_error', { value: detail.error })
  }

  /**
   * Translates a top-level API error key into a human-readable message.
   */
  function translateError(errorKey: string): string {
    const i18nKey = `apiErrors.messages.${errorKey}`
    if (te(i18nKey)) {
      return t(i18nKey)
    }
    return t('apiErrors.messages.internal_error')
  }

  /**
   * Processes an API error (from $fetch catch) and populates
   * `fieldErrors` and/or `globalError`.
   */
  function handleApiError(err: unknown): void {
    clearErrors()

    const apiError = extractApiError(err)
    if (!apiError) {
      globalError.value = t('apiErrors.messages.internal_error')
      return
    }

    // Field-level validation errors
    if (apiError.error_details && apiError.error_details.length > 0) {
      for (const detail of apiError.error_details) {
        fieldErrors.value[detail.field] = translateDetail(detail)
      }
    }

    // Global error (always set for non-field errors, or as a fallback)
    if (!apiError.error_details || apiError.error_details.length === 0) {
      globalError.value = translateError(apiError.error)
    }
  }

  /**
   * Clears all field and global errors.
   */
  function clearErrors(): void {
    fieldErrors.value = {}
    globalError.value = null
  }

  /**
   * Clear error for a specific field.
   */
  function clearFieldError(field: string): void {
    const { [field]: _, ...next } = fieldErrors.value
    fieldErrors.value = next
  }

  /**
   * Processes an API error and sets errors on a vee-validate form.
   */
  function setFormErrors<T extends string>(
    setFieldError: (field: T, message: string | undefined) => void,
    err: unknown,
  ): void {
    handleApiError(err)
    Object.entries(fieldErrors.value).forEach(([field, message]) => {
      setFieldError(field as T, message)
    })
  }

  return {
    fieldErrors: readonly(fieldErrors),
    globalError: readonly(globalError),
    handleApiError,
    setFormErrors,
    clearErrors,
    clearFieldError,
  }
}

/**
 * Extracts an ApiError from various error shapes ($fetch FetchError, raw object, etc.)
 */
function extractApiError(err: unknown): ApiError | null {
  if (!err || typeof err !== 'object') return null

  // $fetch wraps errors in FetchError with a `data` property
  if ('data' in err) {
    const data = (err as { data: unknown }).data
    if (data && typeof data === 'object' && 'error' in data) {
      return data as ApiError
    }
  }

  // Direct ApiError shape
  if ('error' in err && 'error_code' in err) {
    return err as ApiError
  }

  return null
}
