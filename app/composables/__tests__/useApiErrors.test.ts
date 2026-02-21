import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useApiErrors } from '../useApiErrors'

// -- Mocks --
const mockI18n = {
  t: vi.fn((key: string, params?: Record<string, unknown>) => {
    if (params?.value) return `${key}:${params.value}`
    return key
  }),
  te: vi.fn(() => true),
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

vi.stubGlobal('useI18n', () => mockI18n)

describe('useApiErrors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty errors', () => {
    const { fieldErrors, globalError } = useApiErrors()
    expect(fieldErrors.value).toEqual({})
    expect(globalError.value).toBe(null)
  })

  it('handles field validation errors', () => {
    const { fieldErrors, handleApiError } = useApiErrors()
    const apiError = {
      statusCode: 422,
      data: {
        error: 'validation_failed',
        error_code: 422,
        error_details: [
          { field: 'email', error: 'validation_min_length:5' },
          { field: 'password', error: 'validation_required' },
        ],
      },
    }

    handleApiError(apiError)

    expect(fieldErrors.value.email).toBe('apiErrors.details.validation_min_length:5')
    expect(fieldErrors.value.password).toBe('apiErrors.details.validation_required')
  })

  it('handles global errors', () => {
    const { globalError, handleApiError } = useApiErrors()
    const apiError = {
      statusCode: 401,
      data: {
        error: 'invalid_credentials',
        error_code: 401,
      },
    }

    handleApiError(apiError)

    expect(globalError.value).toBe('apiErrors.messages.invalid_credentials')
  })

  it('falls back to internal_error if no translation exists', () => {
    mockI18n.te.mockReturnValue(false)
    const { globalError, handleApiError } = useApiErrors()

    handleApiError({ statusCode: 400, data: { error: 'unknown_error', error_code: 400 } })

    expect(globalError.value).toBe('apiErrors.messages.internal_error')
  })

  it('re-throws fatal errors (500)', () => {
    const { handleApiError } = useApiErrors()
    const fatalError = { statusCode: 500 }

    expect(() => handleApiError(fatalError)).toThrow()
  })

  it('clears errors', () => {
    const { fieldErrors, handleApiError, clearErrors } = useApiErrors()
    handleApiError({
      statusCode: 400,
      data: {
        error: 'err',
        error_details: [{ field: 'f', error: 'e' }],
      },
    })

    clearErrors()

    expect(fieldErrors.value).toEqual({})
  })
})
