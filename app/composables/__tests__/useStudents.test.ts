import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import { useStudents } from '../useStudents'

// -- Mock Nuxt Composables --
const mockRoute = {
  query: {},
}
const mockRouter = {
  push: vi.fn(),
}
const mockState = new Map<string, Ref<unknown>>()

vi.mock('#app/composables/state', () => ({
  useState: (key: string, init: () => unknown) => {
    if (!mockState.has(key)) mockState.set(key, ref(init()))
    return mockState.get(key)
  },
}))

vi.mock('#app/composables/router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}))

const mockStudentService = {
  getStudents: vi.fn(),
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
}

vi.mock('../services/useStudentService', () => ({
  useStudentService: () => mockStudentService,
}))

describe('useStudents', () => {
  beforeEach(() => {
    mockRoute.query = {}
    mockState.clear()
    vi.clearAllMocks()
  })

  it('fetches students on fetchStudents call', async () => {
    const students = [{ id: '1', first_name: 'John', last_name: 'Doe' }]
    mockStudentService.getStudents.mockResolvedValue({
      data: students,
      page: 1,
      item_per_page: 10,
      total_count: 1,
      next_page: null,
      previous_page: null,
    })

    const { fetchStudents, students: studentItems } = useStudents()
    await fetchStudents()

    expect(mockStudentService.getStudents).toHaveBeenCalled()
    expect(studentItems.value).toEqual(students)
  })

  it('creates a student', async () => {
    const newStudent = { first_name: 'Jane', last_name: 'Doe' }
    mockStudentService.createStudent.mockResolvedValue({ id: '2', ...newStudent })

    const { createStudent } = useStudents()
    const result = await createStudent(newStudent)

    expect(mockStudentService.createStudent).toHaveBeenCalledWith(newStudent)
    expect(result.id).toBe('2')
  })

  it('deletes a student', async () => {
    const { deleteStudent } = useStudents()
    await deleteStudent('1')

    expect(mockStudentService.deleteStudent).toHaveBeenCalledWith('1')
  })
})
