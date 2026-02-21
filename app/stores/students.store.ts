import { createStaticPaginatedStore } from './_shared/createStaticPaginatedStore'
import { studentService } from '~/services/student.service'
import type { Student } from '~/types/api'

export const useStudentsStore = createStaticPaginatedStore<
  Student,
  { search?: string } // TFilters
>({
  id: 'students',
  resource: 'students',
  service: {
    list: (params) => studentService.getStudents(params),
    create: (payload) => studentService.createStudent(payload),
    update: (id, payload) => studentService.updateStudent(id, payload),
    delete: (id) => studentService.deleteStudent(id),
  },
  allowedStableFilterKeys: [], // Search is volatile, so no stable filters here
  staleTimeMs: 30_000,
  maxCachedPages: 20,
})
