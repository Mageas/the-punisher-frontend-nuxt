import { getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { useUserStore } from '~/stores/user'

type PlainObject = Record<string, unknown>

type ApplyTimeInputToDateOptions = {
  fallbackTime?: string
  preserveSubMinuteFrom?: string | null | undefined
  timeZone?: string
}

type SerializeEditableDateTimeOptions = {
  dateValue: DateValue | undefined
  timeValue: string | null | undefined
  timeZone: string
  touched: boolean
  initialApiValue?: string | null | undefined
  fallbackTime?: string
}

type NormalizeApiDateTimeFieldsOptions = {
  timeZone?: string
}

type SerializeDateValueWithTimeOptions = {
  dateValue: DateValue | undefined
  timeValue: string | null | undefined
  timeZone?: string
  fallbackTime?: string
  preserveSubMinuteFrom?: string | null | undefined
}

type DateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  millisecond: number
}

function isPlainObject(value: unknown): value is PlainObject {
  if (!value || typeof value !== 'object') {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

export function getUserTimeZone(timeZone?: string): string {
  if (timeZone?.trim()) {
    return timeZone
  }

  try {
    const storeTimeZone = useUserStore().timeZone
    return storeTimeZone?.trim() ? storeTimeZone : getLocalTimeZone()
  } catch {
    return getLocalTimeZone()
  }
}

function padTimeUnit(value: number, length = 2): string {
  return String(value).padStart(length, '0')
}

function formatOffset(offsetMs: number): string {
  const sign = offsetMs >= 0 ? '+' : '-'
  const absoluteOffsetMs = Math.abs(offsetMs)
  const totalMinutes = Math.floor(absoluteOffsetMs / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${sign}${padTimeUnit(hours)}:${padTimeUnit(minutes)}`
}

function formatRfc3339WithOffsetParts(value: DateTimeParts, offsetMs: number): string {
  return (
    `${padTimeUnit(value.year, 4)}-${padTimeUnit(value.month)}-${padTimeUnit(value.day)}` +
    `T${padTimeUnit(value.hour)}:${padTimeUnit(value.minute)}:${padTimeUnit(value.second)}` +
    `.${padTimeUnit(value.millisecond, 3)}${formatOffset(offsetMs)}`
  )
}

const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>()
const offsetFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getDateTimeFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = dateTimeFormatterCache.get(timeZone)

  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
    dateTimeFormatterCache.set(timeZone, formatter)
  }

  return formatter
}

function getOffsetFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = offsetFormatterCache.get(timeZone)

  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
    offsetFormatterCache.set(timeZone, formatter)
  }

  return formatter
}

function getRequiredPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  const part = parts.find((item) => item.type === type)

  if (!part) {
    throw new Error(`Missing "${type}" in datetime formatting parts.`)
  }

  return part.value
}

function getDateTimePartsInTimeZone(date: Date, timeZone: string): DateTimeParts {
  const parts = getDateTimeFormatter(timeZone).formatToParts(date)

  return {
    year: Number.parseInt(getRequiredPart(parts, 'year'), 10),
    month: Number.parseInt(getRequiredPart(parts, 'month'), 10),
    day: Number.parseInt(getRequiredPart(parts, 'day'), 10),
    hour: Number.parseInt(getRequiredPart(parts, 'hour'), 10),
    minute: Number.parseInt(getRequiredPart(parts, 'minute'), 10),
    second: Number.parseInt(getRequiredPart(parts, 'second'), 10),
    millisecond: date.getUTCMilliseconds(),
  }
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getOffsetFormatter(timeZone).formatToParts(date)
  const offsetLabel = getRequiredPart(parts, 'timeZoneName')

  if (offsetLabel === 'GMT' || offsetLabel === 'UTC') {
    return 0
  }

  const match = /^(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(offsetLabel)

  if (!match) {
    throw new Error(`Unsupported timezone offset format "${offsetLabel}".`)
  }

  const sign = match[1] ?? '+'
  const hoursText = match[2] ?? '0'
  const minutesText = match[3]
  const hours = Number.parseInt(hoursText, 10)
  const minutes = Number.parseInt(minutesText ?? '0', 10)
  const totalMs = (hours * 60 + minutes) * 60_000

  return sign === '+' ? totalMs : -totalMs
}

function dateFromTimeZoneParts(parts: DateTimeParts, timeZone: string): Date {
  const targetUtcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  )

  let resolvedUtcMs = targetUtcMs

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offsetMs = getTimeZoneOffsetMs(new Date(resolvedUtcMs), timeZone)
    const nextUtcMs = targetUtcMs - offsetMs

    if (nextUtcMs === resolvedUtcMs) {
      break
    }

    resolvedUtcMs = nextUtcMs
  }

  return new Date(resolvedUtcMs)
}

function toUtcApiDateTimeString(
  value: Date | string | null | undefined,
): string | null | undefined {
  if (value === null || value === undefined) return value
  if (value instanceof Date) return value.toISOString()

  const parsed = parseApiDateTime(value)
  if (!parsed) return value
  return parsed.toISOString()
}

export function parseApiDateTimeInTimeZone(
  value: string | null | undefined,
  timeZone?: string,
): DateTimeParts | null {
  if (!value) return null

  const resolvedTimeZone = getUserTimeZone(timeZone)
  const parsed = parseApiDateTime(value)
  if (!parsed) return null

  return getDateTimePartsInTimeZone(parsed, resolvedTimeZone)
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
 * Convert a Date (or valid datetime string) to RFC3339 in the user's time zone.
 */
export function toApiDateTimeString(
  value: Date | string | null | undefined,
  timeZone?: string,
): string | null | undefined {
  const resolvedTimeZone = getUserTimeZone(timeZone)

  if (resolvedTimeZone === 'UTC') {
    return toUtcApiDateTimeString(value)
  }

  if (value === null || value === undefined) return value
  const parsed = value instanceof Date ? value : parseApiDateTime(value)
  if (!parsed) return typeof value === 'string' ? value : null

  const parts = getDateTimePartsInTimeZone(parsed, resolvedTimeZone)
  return formatRfc3339WithOffsetParts(parts, getTimeZoneOffsetMs(parsed, resolvedTimeZone))
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
export function toTimeInputValue(
  value: string | null | undefined,
  fallbackTime = '08:00',
  timeZone?: string,
): string {
  const parsed = parseApiDateTimeInTimeZone(value, timeZone)
  if (!parsed) return fallbackTime

  const hours = String(parsed.hour).padStart(2, '0')
  const minutes = String(parsed.minute).padStart(2, '0')
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

  if (options.timeZone) {
    const zonedDateTimeParts = getDateTimePartsInTimeZone(date, options.timeZone)
    const nextDate = dateFromTimeZoneParts(
      {
        ...zonedDateTimeParts,
        hour: hours,
        minute: minutes,
        second: seconds,
        millisecond: milliseconds,
      },
      options.timeZone,
    )

    date.setTime(nextDate.getTime())
    return date
  }

  date.setHours(hours, minutes, seconds, milliseconds)
  return date
}

export function serializeDateValueWithTime({
  dateValue,
  timeValue,
  timeZone,
  fallbackTime,
  preserveSubMinuteFrom,
}: SerializeDateValueWithTimeOptions): string | undefined {
  if (!dateValue) return undefined

  const resolvedTimeZone = getUserTimeZone(timeZone)
  const { hours, minutes } = resolveTimeInput(timeValue, fallbackTime ?? '08:00')
  const { seconds, milliseconds } = resolveSubMinutePrecision(preserveSubMinuteFrom)

  const date = dateFromTimeZoneParts(
    {
      year: dateValue.year,
      month: dateValue.month,
      day: dateValue.day,
      hour: hours,
      minute: minutes,
      second: seconds,
      millisecond: milliseconds,
    },
    resolvedTimeZone,
  )

  return toApiDateTimeString(date, resolvedTimeZone) ?? undefined
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
  return serializeDateValueWithTime({
    dateValue,
    timeValue,
    timeZone,
    fallbackTime,
    ...(touched ? {} : { preserveSubMinuteFrom: initialApiValue }),
  })
}

function normalizeDateTimeValue(value: unknown, timeZone?: string): unknown {
  if (value === null || value === undefined) return value
  if (value instanceof Date) {
    return timeZone ? toApiDateTimeString(value, timeZone) : value.toISOString()
  }

  if (typeof value === 'string') {
    const normalized = timeZone
      ? toApiDateTimeString(value, timeZone)
      : toUtcApiDateTimeString(value)
    return normalized ?? value
  }

  return value
}

function normalizeDateTimeFieldsInternal(payload: unknown, timeZone?: string): unknown {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeDateTimeFieldsInternal(item, timeZone))
  }

  if (!isPlainObject(payload)) {
    return payload
  }

  const normalized: PlainObject = {}

  for (const [key, value] of Object.entries(payload)) {
    if (key.endsWith('_at')) {
      normalized[key] = normalizeDateTimeValue(value, timeZone)
      continue
    }

    normalized[key] = normalizeDateTimeFieldsInternal(value, timeZone)
  }

  return normalized
}

/**
 * Normalize every `*_at` field recursively to RFC3339.
 * - Defaults to UTC for API responses.
 * - Can serialize request bodies in the user's IANA time zone offset.
 * - Does not alter date-only fields like `created_from` / `due_to`.
 */
export function normalizeApiDateTimeFields<T>(
  payload: T,
  options: NormalizeApiDateTimeFieldsOptions = {},
): T {
  return normalizeDateTimeFieldsInternal(payload, options.timeZone) as T
}
