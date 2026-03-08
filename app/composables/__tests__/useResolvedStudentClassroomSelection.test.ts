import { describe, expect, it, vi, beforeEach } from 'vitest'
import { nextTick, reactive, ref } from 'vue'
import { useResolvedStudentClassroomSelection } from '../useResolvedStudentClassroomSelection'

const mockStudentService = {
  getStudentById: vi.fn(),
}

vi.mock('../services/useStudentService', () => ({
  useStudentService: () => mockStudentService,
}))

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

function createSelection(options?: {
  open?: boolean
  preselectedStudentId?: string | null
  preselectedClassroomId?: string | null
  values?: {
    student_lookup_classroom_id?: string
    student_id?: string
    classroom_id?: string
  }
}) {
  const values = reactive({
    student_lookup_classroom_id: '',
    student_id: '',
    classroom_id: '',
    ...options?.values,
  })
  const setFieldError = vi.fn()
  const setFieldValue = vi.fn((field: 'classroom_id' | 'student_id', value: string) => {
    values[field] = value
  })

  const selection = useResolvedStudentClassroomSelection({
    open: ref(options?.open ?? true),
    values,
    setFieldValue,
    setFieldError,
    preselectedStudentId: options?.preselectedStudentId,
    preselectedClassroomId: options?.preselectedClassroomId,
  })

  return {
    values,
    setFieldError,
    setFieldValue,
    selection,
  }
}

describe('useResolvedStudentClassroomSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes from a preselected student and cleans up the selection state', async () => {
    mockStudentService.getStudentById.mockResolvedValue({
      classrooms: [{ id: 'class-1', name: 'Class 1' }],
    })

    const { selection, setFieldValue } = createSelection({
      preselectedStudentId: 'student-1',
      values: {
        student_id: 'student-1',
      },
    })

    await selection.initializeResolvedStudentClassroomSelection()

    expect(mockStudentService.getStudentById).toHaveBeenCalledWith('student-1')
    expect(selection.selectedStudentClassroomId.value).toBe('class-1')
    expect(selection.requiresStudentClassroomSelection.value).toBe(false)
    expect(selection.isStudentClassroomMissing.value).toBe(false)
    expect(setFieldValue).toHaveBeenLastCalledWith('classroom_id', 'class-1', false)

    selection.cleanupResolvedStudentClassroomSelection()

    expect(selection.selectedStudentClassroomId.value).toBe('')
    expect(selection.selectedStudentClassrooms.value).toEqual([])
  })

  it('resets the student and resolved classroom when the lookup classroom changes', async () => {
    const { values, selection, setFieldValue } = createSelection({
      values: {
        student_lookup_classroom_id: 'class-1',
        student_id: 'student-1',
        classroom_id: 'class-1',
      },
    })

    values.student_lookup_classroom_id = 'class-2'
    await nextTick()

    expect(selection.selectedStudentClassroomId.value).toBe('class-2')
    expect(selection.selectedStudentClassrooms.value).toEqual([])
    expect(values.student_id).toBe('')
    expect(setFieldValue).toHaveBeenCalledWith('classroom_id', 'class-2', false)
    expect(setFieldValue).toHaveBeenCalledWith('student_id', '', false)
  })

  it('ignores stale classroom lookups from previous student selections', async () => {
    let resolveFirst: ((value: { classrooms: { id: string; name: string }[] }) => void) | null =
      null
    let resolveSecond: ((value: { classrooms: { id: string; name: string }[] }) => void) | null =
      null

    mockStudentService.getStudentById.mockImplementation((studentId: string) => {
      if (studentId === 'student-1') {
        return new Promise((resolve) => {
          resolveFirst = resolve
        })
      }

      return new Promise((resolve) => {
        resolveSecond = resolve
      })
    })

    const { values, selection } = createSelection({
      values: {
        student_lookup_classroom_id: 'class-2',
      },
    })

    values.student_id = 'student-1'
    await nextTick()

    values.student_id = 'student-2'
    await nextTick()

    expect(resolveSecond).toBeTypeOf('function')
    resolveSecond!({
      classrooms: [{ id: 'class-2', name: 'Class 2' }],
    })
    await flushPromises()

    expect(selection.selectedStudentClassroomId.value).toBe('class-2')

    expect(resolveFirst).toBeTypeOf('function')
    resolveFirst!({
      classrooms: [{ id: 'class-1', name: 'Class 1' }],
    })
    await flushPromises()

    expect(selection.selectedStudentClassroomId.value).toBe('class-2')
    expect(selection.studentClassroomOptions.value).toEqual([{ id: 'class-2', name: 'Class 2' }])
  })
})
