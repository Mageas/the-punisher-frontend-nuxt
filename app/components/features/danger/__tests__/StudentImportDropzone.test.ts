import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentImportDropzone from '../StudentImportDropzone.vue'

const translations: Record<string, string> = {
  'dangerZone.importStudents.dropActive': 'Deposez le fichier',
  'dangerZone.importStudents.dropHint': 'Glissez le fichier ici',
  'dangerZone.importStudents.changeFile': 'Changer le fichier',
  'dangerZone.importStudents.selectFile': 'Selectionner un fichier',
  'dangerZone.importStudents.button': 'Importer',
  'dangerZone.importStudents.uploading': 'Import en cours',
  'dangerZone.importStudents.clearFile': 'Retirer le fichier',
}

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
    te: () => true,
  }),
}))

const stubs = {
  Button: {
    props: ['disabled'],
    template: '<button type="button" :disabled="disabled"><slot /></button>',
  },
}

describe('StudentImportDropzone', () => {
  it('emits the selected file from the native file input', async () => {
    const wrapper = mount(StudentImportDropzone, {
      global: {
        stubs,
      },
    })

    const input = wrapper.get('input[type="file"]')
    const file = new File(['id,first_name'], 'students.csv', { type: 'text/csv' })

    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [file],
    })

    await input.trigger('change')

    expect(wrapper.emitted('file-selected')).toEqual([[file]])
  })

  it('renders the selected file row and forwards clear/import actions', async () => {
    const wrapper = mount(StudentImportDropzone, {
      props: {
        selectedFileName: 'students.xlsx',
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('students.xlsx')
    expect(wrapper.text()).toContain('Changer le fichier')
    expect(wrapper.text()).toContain('Importer')

    await wrapper.get('[data-testid="student-import-clear-file"]').trigger('click')
    await wrapper.get('[data-testid="student-import-submit"]').trigger('click')

    expect(wrapper.emitted('clear-file')).toEqual([[]])
    expect(wrapper.emitted('import')).toEqual([[]])
  })
})
