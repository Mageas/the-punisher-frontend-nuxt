import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a short localised format (e.g. "19 févr. 2026").
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a date string to a localised date + time (e.g. "19 févr. 2026, 14:30").
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a date string to time only (e.g. "14:30").
 */
export function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get initials from a person's first and last name.
 */
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const firstInitial = firstName?.charAt(0) ?? ''
  const lastInitial = lastName?.charAt(0) ?? ''
  return `${firstInitial}${lastInitial}`.toUpperCase()
}

/**
 * Format points with optional 'pt' or 'pts' suffix.
 */
export function formatPoints(points: number): string {
  const suffix = points > 1 ? 'pts' : 'pt'
  return `${points} ${suffix}`
}
