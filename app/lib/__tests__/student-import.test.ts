import { describe, expect, it } from 'vitest'
import {
  extractStudentImportRowErrors,
  getStudentImportGlobalErrorMessage,
  getStudentImportRowErrorMessage,
  isStudentImportRowError,
} from '../student-import'

describe('student-import.ts', () => {
  describe('isStudentImportRowError', () => {
    it('accepts row errors enriched with row/value context', () => {
      expect(
        isStudentImportRowError({
          row: 4,
          field: 'classroom',
          error: 'validation_field_required',
          value: '',
          error_details: ['expected:class_name'],
        }),
      ).toBe(true)
    })

    it('rejects row errors with malformed error_details entries', () => {
      expect(
        isStudentImportRowError({
          row: 4,
          field: 'classroom',
          error: 'import_invalid_format',
          error_details: ['expected:class_name', 2],
        }),
      ).toBe(false)
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
            error_details: ['expected:yyyy-yyyy'],
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
          error_details: ['expected:yyyy-yyyy'],
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

  describe('getStudentImportRowErrorMessage', () => {
    it('translates known import_* errors with error_details context', () => {
      const message = getStudentImportRowErrorMessage(
        {
          row: 4,
          field: 'classes',
          error: 'import_invalid_length',
          value: 'A',
          error_details: ['min:2', 'max:100'],
        },
        (_key, params) => `min=${params?.min};max=${params?.max}`,
        (key) => key === 'apiErrors.details.import_invalid_length',
      )

      expect(message).toBe('min=2;max=100')
    })

    it('supports legacy detail keys with inline values', () => {
      const message = getStudentImportRowErrorMessage(
        {
          row: 4,
          field: 'classes',
          error: 'validation_min_length:2',
          value: 'A',
        },
        (_key, params) => `value=${params?.value}`,
        (key) => key === 'apiErrors.details.validation_min_length',
      )

      expect(message).toBe('value=2')
    })

    it('keeps a readable fallback for unknown keys', () => {
      const message = getStudentImportRowErrorMessage(
        {
          row: 2,
          field: 'eleves',
          error: 'import_unknown_error',
          value: 'Jean',
          error_details: ['expected:uppercase_last_name_then_first_name', 'min:2'],
        },
        () => '',
        () => false,
      )

      expect(message).toBe(
        'import_unknown_error (expected:uppercase_last_name_then_first_name, min:2)',
      )
    })

    it('translates expected context values when a translation exists', () => {
      const message = getStudentImportRowErrorMessage(
        {
          row: 2,
          field: 'eleves',
          error: 'import_invalid_format',
          value: 'Jean',
          error_details: ['expected:uppercase_last_name_then_first_name'],
        },
        (key, params) => {
          if (key === 'apiErrors.importContext.expected.uppercase_last_name_then_first_name') {
            return 'NOM Prenom'
          }
          if (key === 'apiErrors.details.import_invalid_format') {
            return `expected=${params?.expected}`
          }
          return key
        },
        (key) =>
          key === 'apiErrors.details.import_invalid_format' ||
          key === 'apiErrors.importContext.expected.uppercase_last_name_then_first_name',
      )

      expect(message).toBe('expected=NOM Prenom')
    })
  })

  describe('getStudentImportGlobalErrorMessage', () => {
    it('keeps top-level import message when no non-row details are available', () => {
      const message = getStudentImportGlobalErrorMessage(
        {
          error: 'import_validation_failed',
          error_details: [{ row: 2, field: 'eleves', error: 'import_required_field' }],
        },
        (key) => key,
        (key) => key === 'apiErrors.messages.import_validation_failed',
      )

      expect(message).toBe('apiErrors.messages.import_validation_failed')
    })

    it('appends translated non-row detail messages for file/template errors', () => {
      const message = getStudentImportGlobalErrorMessage(
        {
          error: 'import_file_invalid',
          error_details: [
            { field: 'file', error: 'unsupported_file_type', value: '.txt' },
            { field: 'file', error: 'unsupported_file_type', value: '.txt' },
          ],
        },
        (key, params) => {
          if (key === 'apiErrors.messages.import_file_invalid') {
            return 'Import invalide.'
          }
          if (key === 'apiErrors.details.unsupported_file_type') {
            return `Type non supporté: ${params?.value}`
          }
          return key
        },
        (key) =>
          key === 'apiErrors.messages.import_file_invalid' ||
          key === 'apiErrors.details.unsupported_file_type',
      )

      expect(message).toBe('Import invalide. Type non supporté: .txt')
    })
  })
})
