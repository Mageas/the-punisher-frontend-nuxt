import type { DateValue } from '@internationalized/date'

type PlainObject = Record<string, unknown>

type ApplyTimeInputToDateOptions = {
  fallbackTime?: string
  preserveSubMinuteFrom?: string | null | undefined
}

type SerializeEditableDateTimeOptions = {
  dateValue: DateValue | undefined
  timeValue: string | null | undefined
  timeZone: string
  touched: boolean
  initialApiValue?: string | null | undefined
  fallbackTime?: string
}

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

function clampTimeUnit(
  value: string | undefined,
  fallbackValue: number,
  minValue: number,
  maxValue: number,
): number {
  const parsedValue = Number.parseInt(value ?? '', 10)

  if (Number.isNaN(parsedValue)) {
    return fallbackValue
  }

  return Math.min(Math.max(parsedValue, minValue), maxValue)
}

function resolveTimeInput(
  value: string | null | undefined,
  fallbackTime: string,
): { hours: number; minutes: number } {
  const source = value?.trim() ? value : fallbackTime
  const [rawHours = '08', rawMinutes = '00'] = source.split(':')

  return {
    hours: clampTimeUnit(rawHours, 8, 0, 23),
    minutes: clampTimeUnit(rawMinutes, 0, 0, 59),
  }
}

function resolveSubMinutePrecision(value: string | null | undefined): {
  seconds: number
  milliseconds: number
} {
  const parsed = parseApiDateTime(value)

  return {
    seconds: parsed?.getSeconds() ?? 0,
    milliseconds: parsed?.getMilliseconds() ?? 0,
  }
}

/**
 * Format an API datetime for a time-only input (`HH:mm`), hiding seconds.
 */
export function toTimeInputValue(value: string | null | undefined, fallbackTime = '08:00'): string {
  const parsed = parseApiDateTime(value)
  if (!parsed) return fallbackTime

  const hours = String(parsed.getHours()).padStart(2, '0')
  const minutes = String(parsed.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Apply an `HH:mm` input to a Date.
 * Creation defaults hidden seconds to `00`; edition can preserve them from an API datetime.
 */
export function applyTimeInputToDate(
  date: Date,
  value: string | null | undefined,
  options: ApplyTimeInputToDateOptions = {},
): Date {
  const { hours, minutes } = resolveTimeInput(value, options.fallbackTime ?? '08:00')
  const { seconds, milliseconds } = resolveSubMinutePrecision(options.preserveSubMinuteFrom)

  date.setHours(hours, minutes, seconds, milliseconds)
  return date
}

/**
 * Serialize an editable datetime field from a date picker + `HH:mm` input.
 * - Untouched edit values preserve API-provided seconds/milliseconds.
 * - Touched values reset hidden seconds/milliseconds to `00`.
 */
export function serializeEditableDateTime({
  dateValue,
  timeValue,
  timeZone,
  touched,
  initialApiValue,
  fallbackTime,
}: SerializeEditableDateTimeOptions): string | undefined {
  if (!dateValue) return undefined

  const date = dateValue.toDate(timeZone)

  applyTimeInputToDate(
    date,
    timeValue,
    touched
      ? { fallbackTime }
      : {
          fallbackTime,
          preserveSubMinuteFrom: initialApiValue,
        },
  )

  return toApiDateTimeString(date) ?? undefined
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
