import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentImportErrorsTable from '../StudentImportErrorsTable.vue'

const translations: Record<string, string> = {
  'dangerZone.importStudents.errorTitle': 'Import impossible',
  'dangerZone.importStudents.errorRowHeader': 'Ligne',
  'dangerZone.importStudents.errorFieldHeader': 'Champ',
  'dangerZone.importStudents.errorMessageHeader': 'Message',
  'dangerZone.importStudents.errorValueHeader': 'Valeur',
}

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
    te: () => true,
  }),
}))

const stubs = {
  Alert: {
    template: '<div><slot /></div>',
  },
  AlertTitle: {
    template: '<div><slot /></div>',
  },
  AlertDescription: {
    template: '<div><slot /></div>',
  },
  Table: {
    template: '<table><slot /></table>',
  },
  TableHeader: {
    template: '<thead><slot /></thead>',
  },
  TableBody: {
    template: '<tbody><slot /></tbody>',
  },
  TableRow: {
    template: '<tr><slot /></tr>',
  },
  TableHead: {
    template: '<th><slot /></th>',
  },
  TableCell: {
    template: '<td><slot /></td>',
  },
}

describe('StudentImportErrorsTable', () => {
  it('renders the row-level import errors in a table', () => {
    const wrapper = mount(StudentImportErrorsTable, {
      props: {
        errors: [
          {
            row: 2,
            field: 'classroom',
            error: 'required',
            value: '',
            message: 'Classe obligatoire',
          },
          {
            row: 5,
            field: 'first_name',
            error: 'invalid',
            value: '123',
            message: 'Prenom invalide',
          },
        ],
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.get('[data-testid="student-import-errors-table"]').text()).toContain(
      'Import impossible',
    )
    expect(wrapper.findAll('[data-testid="student-import-error-row"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Classe obligatoire')
    expect(wrapper.text()).toContain('Prenom invalide')
    expect(wrapper.text()).toContain('123')
  })
})
