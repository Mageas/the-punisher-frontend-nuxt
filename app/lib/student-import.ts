import type { StudentImportRowError } from '~/types/api'

interface StudentImportRowErrorCandidate extends Record<string, unknown> {
  row: number
  field: string
  error?: string
  message?: string
  value?: string
}

function getImportErrorMessage(detail: Record<string, unknown>): string | null {
  if (typeof detail.error === 'string') {
    return detail.error
  }

  if (typeof detail.message === 'string') {
    return detail.message
  }

  return null
}

export function isStudentImportRowError(detail: unknown): detail is StudentImportRowErrorCandidate {
  if (!detail || typeof detail !== 'object') {
    return false
  }

  const candidate = detail as StudentImportRowErrorCandidate

  return (
    typeof candidate.row === 'number' &&
    Number.isFinite(candidate.row) &&
    typeof candidate.field === 'string' &&
    getImportErrorMessage(candidate) !== null &&
    (typeof candidate.value === 'undefined' || typeof candidate.value === 'string')
  )
}

export function extractStudentImportRowErrors(details?: unknown[]): StudentImportRowError[] {
  return (details ?? []).flatMap((detail) => {
    if (!isStudentImportRowError(detail)) {
      return []
    }

    const errorMessage = getImportErrorMessage(detail)
    if (!errorMessage) {
      return []
    }

    return [
      {
        row: detail.row,
        field: detail.field,
        error: errorMessage,
        value: detail.value,
      },
    ]
  })
}
