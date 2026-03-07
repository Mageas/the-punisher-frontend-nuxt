import { describe, expect, it } from 'vitest'
import {
  getEmailFieldError,
  getPasswordConfirmationError,
  getPasswordFieldError,
  getRequiredFieldError,
  hasClientValidationErrors,
} from '../auth-form-validation'

function t(key: string, params?: Record<string, unknown>) {
  if (params?.count) {
    return `${key}:${params.count}`
  }

  return key
}

describe('auth-form-validation', () => {
  it('only shows required errors after submit for regular fields', () => {
    expect(getRequiredFieldError('', t, { submitted: false })).toBe('')
    expect(getRequiredFieldError('', t, { submitted: true })).toBe(
      'apiErrors.details.validation_field_required',
    )
  })

  it('validates emails locally before the API request', () => {
    expect(getEmailFieldError('teacher@example.com', t, { submitted: true })).toBe('')
    expect(getEmailFieldError('teacher@invalid', t, { submitted: true })).toBe(
      'apiErrors.details.validation_invalid_email',
    )
  })

  it('shows password rule errors live once the user starts typing', () => {
    expect(getPasswordFieldError('', t, { submitted: false })).toBe('')
    expect(getPasswordFieldError('short', t, { submitted: false })).toBe(
      'auth.passwordRequirements.minLength:8',
    )
    expect(getPasswordFieldError('', t, { submitted: true })).toBe(
      'apiErrors.details.validation_field_required',
    )
  })

  it('validates password confirmation in real time', () => {
    expect(getPasswordConfirmationError('Password123', '', t, { submitted: false })).toBe('')
    expect(
      getPasswordConfirmationError('Password123', 'Password321', t, { submitted: false }),
    ).toBe('auth.passwordMismatch')
  })

  it('detects when a client-side validation map contains errors', () => {
    expect(
      hasClientValidationErrors({
        email: '',
        password: 'auth.passwordRequirements.minLength:8',
      }),
    ).toBe(true)
    expect(
      hasClientValidationErrors({
        email: '',
        password: '',
      }),
    ).toBe(false)
  })
})
