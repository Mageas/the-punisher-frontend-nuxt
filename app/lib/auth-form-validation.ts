export const MIN_PASSWORD_LENGTH = 8

type TranslateFn = (key: string, params?: Record<string, unknown>) => string

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getRequiredFieldError(
  value: string,
  t: TranslateFn,
  options?: {
    submitted?: boolean
  },
): string {
  if (value.trim()) {
    return ''
  }

  return options?.submitted ? t('apiErrors.details.validation_field_required') : ''
}

export function getEmailFieldError(
  value: string,
  t: TranslateFn,
  options?: {
    submitted?: boolean
  },
): string {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return options?.submitted ? t('apiErrors.details.validation_field_required') : ''
  }

  return EMAIL_PATTERN.test(trimmedValue) ? '' : t('apiErrors.details.validation_invalid_email')
}

export function getPasswordFieldError(
  value: string,
  t: TranslateFn,
  options?: {
    submitted?: boolean
  },
): string {
  if (!value) {
    return options?.submitted ? t('apiErrors.details.validation_field_required') : ''
  }

  return value.length >= MIN_PASSWORD_LENGTH
    ? ''
    : t('auth.passwordRequirements.minLength', { count: MIN_PASSWORD_LENGTH })
}

export function getPasswordConfirmationError(
  password: string,
  confirmation: string,
  t: TranslateFn,
  options?: {
    submitted?: boolean
  },
): string {
  if (!confirmation) {
    return options?.submitted ? t('apiErrors.details.validation_field_required') : ''
  }

  return password === confirmation ? '' : t('auth.passwordMismatch')
}

export function hasClientValidationErrors(errors: Record<string, string>): boolean {
  return Object.values(errors).some(Boolean)
}
