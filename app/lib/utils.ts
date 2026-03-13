import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getUserTimeZone, parseApiDateTime } from './date-time'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a short localised format (e.g. "19 févr. 2026").
 */
export function formatDate(dateStr: string | null | undefined, timeZone?: string): string {
  const parsed = parseApiDateTime(dateStr)
  if (!parsed) return ''

  return parsed.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    timeZone: getUserTimeZone(timeZone),
    year: 'numeric',
  })
}

/**
 * Format a date string to a localised date + time (e.g. "19 févr. 2026, 14:30").
 */
export function formatDateTime(dateStr: string | null | undefined, timeZone?: string): string {
  const parsed = parseApiDateTime(dateStr)
  if (!parsed) return ''

  return parsed.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: getUserTimeZone(timeZone),
  })
}

/**
 * Format a date string to time only (e.g. "14:30").
 */
export function formatTime(dateStr: string | null | undefined, timeZone?: string): string {
  const parsed = parseApiDateTime(dateStr)
  if (!parsed) return ''

  return parsed.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: getUserTimeZone(timeZone),
  })
}

/**
 * Get initials from a person's first and last name.
 */
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const firstInitial = firstName?.trim().charAt(0) ?? ''
  const lastInitial = lastName?.trim().charAt(0) ?? ''
  return `${firstInitial}${lastInitial}`.toUpperCase()
}

/**
 * Checks if a string is a valid UUID (36 characters).
 */
export function isUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
  )
}

/**
 * Format points with optional 'pt' or 'pts' suffix.
 */
export function formatPoints(points: number): string {
  const suffix = points > 1 ? 'pts' : 'pt'
  return `${points} ${suffix}`
}
