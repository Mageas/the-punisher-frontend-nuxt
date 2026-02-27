import { describe, expect, it } from 'vitest'
import { extractStudentImportRowErrors, isStudentImportRowError } from '../student-import'

describe('student-import.ts', () => {
  describe('isStudentImportRowError', () => {
    it('accepts row errors enriched with row/value context', () => {
      expect(
        isStudentImportRowError({
          row: 4,
          field: 'classroom',
          error: 'validation_field_required',
          value: '',
        }),
      ).toBe(true)
    })

    it('rejects regular validation details without a row number', () => {
      expect(
        isStudentImportRowError({
          field: 'file',
          error: 'validation_failed',
        }),
      ).toBe(false)
    })
  })

  describe('extractStudentImportRowErrors', () => {
    it('keeps only row-level import errors', () => {
      expect(
        extractStudentImportRowErrors([
          {
            row: 2,
            field: 'first_name',
            error: 'validation_field_required',
            value: '',
          },
          {
            field: 'file',
            error: 'import_file_invalid',
          },
          {
            row: 3,
            field: 'year',
            error: 'validation_malformed_parameter',
            value: '2025/2026',
          },
        ]),
      ).toEqual([
        {
          row: 2,
          field: 'first_name',
          error: 'validation_field_required',
          value: '',
        },
        {
          row: 3,
          field: 'year',
          error: 'validation_malformed_parameter',
          value: '2025/2026',
        },
      ])
    })

    it('normalizes backend row errors using the message field', () => {
      expect(
        extractStudentImportRowErrors([
          {
            row: 5,
            field: 'classes',
            message: 'Classe inconnue',
            value: '4eme Z',
          },
        ]),
      ).toEqual([
        {
          row: 5,
          field: 'classes',
          error: 'Classe inconnue',
          value: '4eme Z',
        },
      ])
    })
  })
})
