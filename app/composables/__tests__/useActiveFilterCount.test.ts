import { describe, it, expect } from 'vitest'
import { nextTick, ref } from 'vue'
import { useActiveFilterCount } from '../useActiveFilterCount'

describe('useActiveFilterCount', () => {
  it('counts only non-empty filter values', async () => {
    const classroomId = ref('class-1')
    const studentId = ref('')
    const overdue = ref('true')
    const disabled = ref(false)

    const count = useActiveFilterCount([classroomId, studentId, overdue, disabled])

    expect(count.value).toBe(2)

    studentId.value = 'student-1'
    await nextTick()
    expect(count.value).toBe(3)

    overdue.value = ''
    await nextTick()
    expect(count.value).toBe(2)
  })
})
