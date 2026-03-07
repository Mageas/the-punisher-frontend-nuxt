import { describe, it, expect, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useTrackingFiltersSync } from '../useTrackingFiltersSync'

describe('useTrackingFiltersSync', () => {
  it('resets dependent filters before applying the next filter state', async () => {
    const classroomId = ref('')
    const studentId = ref('student-1')
    const typeId = ref('')
    const applyFilters = vi.fn()

    useTrackingFiltersSync({
      filterRefs: [classroomId, studentId, typeId],
      buildFilters: () => ({
        classroom_id: classroomId.value || undefined,
        student_id: studentId.value || undefined,
        type_id: typeId.value || undefined,
      }),
      applyFilters,
      resetPairs: [{ source: classroomId, target: studentId }],
    })

    classroomId.value = 'class-1'
    await nextTick()

    expect(studentId.value).toBe('')
    expect(applyFilters).toHaveBeenLastCalledWith({
      classroom_id: 'class-1',
      student_id: undefined,
      type_id: undefined,
    })

    applyFilters.mockClear()
    typeId.value = 'type-1'
    await nextTick()

    expect(applyFilters).toHaveBeenCalledWith({
      classroom_id: 'class-1',
      student_id: undefined,
      type_id: 'type-1',
    })
  })
})
