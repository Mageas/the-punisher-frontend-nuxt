import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentImportSummary from '../StudentImportSummary.vue'

const translations: Record<string, string | ((params?: Record<string, number>) => string)> = {
  'dangerZone.importStudents.successTitle': 'Import reussi',
  'dangerZone.importStudents.summaryProcessed': (params) =>
    `${params?.processed} importees sur ${params?.total} lignes`,
  'dangerZone.importStudents.summaryStudentsCreated': 'crees',
  'dangerZone.importStudents.summaryStudentsExisting': 'existants',
  'dangerZone.importStudents.summaryClassroomsCreated': 'creees',
  'dangerZone.importStudents.summaryClassroomsExisting': 'existantes',
  'dangerZone.importStudents.summaryLinks': 'Liens',
  'dangerZone.importStudents.rowsFailed': 'Lignes en erreur',
  'common.titles.students': 'Eleves',
  'common.titles.classes': 'Classes',
}

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, number>) => {
      const value = translations[key]
      if (typeof value === 'function') return value(params)
      return value ?? key
    },
    te: () => true,
  }),
}))

describe('StudentImportSummary', () => {
  it('renders the import header, the three stats and the failed rows banner', () => {
    const wrapper = mount(StudentImportSummary, {
      props: {
        summary: {
          rows_total: 10,
          rows_processed: 8,
          students_created: 3,
          students_existing: 1,
          classrooms_created: 2,
          classrooms_existing: 4,
          links_created: 5,
          links_existing: 2,
          rows_failed: 2,
        },
      },
    })

    expect(wrapper.get('[data-testid="student-import-summary"]').text()).toContain('Import reussi')
    expect(wrapper.text()).toContain('8 importees sur 10 lignes')
    expect(wrapper.get('[data-testid="student-import-summary-stat-students"]').text()).toContain(
      'Eleves',
    )
    expect(wrapper.get('[data-testid="student-import-summary-stat-classrooms"]').text()).toContain(
      'Classes',
    )
    expect(wrapper.get('[data-testid="student-import-summary-stat-links"]').text()).toContain(
      'Liens',
    )
    expect(wrapper.get('[data-testid="student-import-summary-failed-banner"]').text()).toContain(
      '2 lignes en erreur',
    )
  })

  it('hides the failed rows banner when every row is processed successfully', () => {
    const wrapper = mount(StudentImportSummary, {
      props: {
        summary: {
          rows_total: 4,
          rows_processed: 4,
          students_created: 1,
          students_existing: 3,
          classrooms_created: 0,
          classrooms_existing: 2,
          links_created: 1,
          links_existing: 3,
          rows_failed: 0,
        },
      },
    })

    expect(wrapper.find('[data-testid="student-import-summary-failed-banner"]').exists()).toBe(
      false,
    )
  })
})
