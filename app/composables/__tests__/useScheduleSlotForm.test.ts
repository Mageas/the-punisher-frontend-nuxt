import { describe, expect, it, vi, beforeEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { useScheduleSlotForm } from '../useScheduleSlotForm'

const mockClassroomService = {
  getClassrooms: vi.fn(),
}

vi.mock('../services/useClassroomService', () => ({
  useClassroomService: () => mockClassroomService,
}))

function createForm(options?: {
  scheduleSlot?: {
    id: string
    weekday: 'monday'
    start_time: string
    end_time: string
    week_pattern: 'every_week'
    classrooms: Array<{ id: string; name: string }>
    created_at: string
    updated_at: string
  } | null
  prefillWeekday?: 'monday' | null
  prefillStartTime?: string | null
  prefillEndTime?: string | null
}) {
  const open = ref(false)
  const clearErrors = vi.fn()
  const scheduleSlot = ref(options?.scheduleSlot ?? null)
  const prefillWeekday = ref(options?.prefillWeekday ?? null)
  const prefillStartTime = ref(options?.prefillStartTime ?? null)
  const prefillEndTime = ref(options?.prefillEndTime ?? null)

  const formState = useScheduleSlotForm({
    open,
    scheduleSlot,
    prefillWeekday,
    prefillStartTime,
    prefillEndTime,
    clearErrors,
    t: (key: string) => key,
  })

  return {
    open,
    clearErrors,
    scheduleSlot,
    prefillWeekday,
    prefillStartTime,
    prefillEndTime,
    formState,
  }
}

describe('useScheduleSlotForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hydrates the form from the edited schedule slot when the modal opens', async () => {
    const { open, formState, clearErrors } = createForm({
      scheduleSlot: {
        id: 'slot-1',
        weekday: 'monday',
        start_time: '08:00',
        end_time: '09:00',
        week_pattern: 'every_week',
        classrooms: [{ id: 'class-1', name: '6A' }],
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
      },
    })

    open.value = true
    await nextTick()

    expect(clearErrors).toHaveBeenCalled()
    expect(formState.form.weekday).toBe('monday')
    expect(formState.form.start_time).toBe('08:00')
    expect(formState.form.end_time).toBe('09:00')
    expect(formState.selectedClassrooms.value).toEqual([{ id: 'class-1', name: '6A' }])
    expect(formState.getSubmitData()).toEqual({
      weekday: 'monday',
      start_time: '08:00',
      end_time: '09:00',
      week_pattern: 'every_week',
      classroom_ids: ['class-1'],
    })
  })

  it('applies create prefills, auto-computes the end time and validates the form', async () => {
    const { open, formState } = createForm({
      prefillWeekday: 'monday',
      prefillStartTime: '10:00',
    })

    open.value = true
    await nextTick()

    expect(formState.form.weekday).toBe('monday')
    expect(formState.form.start_time).toBe('10:00')
    expect(formState.form.end_time).toBe('10:55')
    expect(formState.validateForm()).toBe(false)
    expect(formState.clientErrors.value.classroom_ids).toBe('apiErrors.details.validation_field_required')

    formState.addClassroom({ id: 'class-2', name: '5B' })
    expect(formState.validateForm()).toBe(true)
  })

  it('dedupes classroom selection and maps classroom fetch results', async () => {
    mockClassroomService.getClassrooms.mockResolvedValue({
      data: [{ id: 'class-3', name: '4C' }],
      total: 1,
      current_page: 1,
      last_page: 1,
      per_page: 10,
      next_page: null,
      prev_page: null,
    })

    const { formState } = createForm()

    formState.addClassroom({ id: 'class-3', name: '4C' })
    formState.addClassroom({ id: 'class-3', name: '4C' })

    expect(formState.form.classroom_ids).toEqual(['class-3'])
    expect(formState.selectedClassrooms.value).toEqual([{ id: 'class-3', name: '4C' }])

    const response = await formState.fetchClassroomOptions({ page: 1, search: '4' })

    expect(mockClassroomService.getClassrooms).toHaveBeenCalledWith({ page: 1, search: '4' })
    expect(response.data).toEqual([{ id: 'class-3', name: '4C' }])
  })
})
