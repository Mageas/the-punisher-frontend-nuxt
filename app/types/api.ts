/**
 * Standard API error response from the backend.
 */
export interface ApiError {
  error: string
  error_code: number
  error_details?: ApiErrorDetail[]
}

/**
 * A single field-level validation error detail.
 * The `error` field can be a simple key like "validation_field_required"
 * or a key with a value like "validation_min_length:8".
 */
export interface ApiErrorDetail {
  field: string
  error: string
}
