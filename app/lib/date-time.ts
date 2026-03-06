type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  if (!value || typeof value !== 'object') {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

/**
 * Parse a datetime coming from the API (`*_at` fields).
 * Returns `null` if value is empty or invalid.
 */
export function parseApiDateTime(value: string | null | undefined): Date | null {
  if (!value) return null

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

/**
 * Convert a Date (or valid datetime string) to normalized RFC3339 UTC.
 */
export function toApiDateTimeString(
  value: Date | string | null | undefined,
): string | null | undefined {
  if (value === null || value === undefined) return value
  if (value instanceof Date) return value.toISOString()

  const parsed = parseApiDateTime(value)
  if (!parsed) return value
  return parsed.toISOString()
}

function normalizeDateTimeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (value instanceof Date) return value.toISOString()

  if (typeof value === 'string') {
    const parsed = parseApiDateTime(value)
    return parsed ? parsed.toISOString() : value
  }

  return value
}

function normalizeDateTimeFieldsInternal(payload: unknown): unknown {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeDateTimeFieldsInternal(item))
  }

  if (!isPlainObject(payload)) {
    return payload
  }

  const normalized: PlainObject = {}

  for (const [key, value] of Object.entries(payload)) {
    if (key.endsWith('_at')) {
      normalized[key] = normalizeDateTimeValue(value)
      continue
    }

    normalized[key] = normalizeDateTimeFieldsInternal(value)
  }

  return normalized
}

/**
 * Normalize every `*_at` field recursively to RFC3339 UTC (`.toISOString()`).
 * - Intended for API responses and JSON request bodies.
 * - Does not alter date-only fields like `created_from` / `due_to`.
 */
export function normalizeApiDateTimeFields<T>(payload: T): T {
  return normalizeDateTimeFieldsInternal(payload) as T
}
