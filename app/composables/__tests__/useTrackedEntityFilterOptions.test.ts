import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useTrackedEntityFilterOptions } from '../useTrackedEntityFilterOptions'

const mockClassroomService = {
  getClassrooms: vi.fn(),
  getClassroomStudents: vi.fn(),
}

const mockStudentService = {
  getStudents: vi.fn(),
}

const mockTypeService = {
  getBonusTypes: vi.fn(),
  getPenaltyTypes: vi.fn(),
  getPunishmentTypes: vi.fn(),
}

vi.mock('../services/useClassroomService', () => ({
  useClassroomService: () => mockClassroomService,
}))

vi.mock('../services/useStudentService', () => ({
  useStudentService: () => mockStudentService,
}))

vi.mock('../services/useTypeService', () => ({
  useTypeService: () => mockTypeService,
}))

function createPaginatedResponse<T>(data: T[]) {
  return {
    page: 1,
    item_per_page: 10,
    total_count: data.length,
    previous_page: null,
    next_page: null,
    data,
  }
}

describe('useTrackedEntityFilterOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps classrooms, students and types to id-name options', async () => {
    const classroomId = ref('')

    mockClassroomService.getClassrooms.mockResolvedValue(
      createPaginatedResponse([
        {
          id: 'class-1',
          name: '6A',
          year: '2025',
          main_teacher: 'Mrs Doe',
          student_count: 25,
          students_preview: [],
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ]),
    )
    mockStudentService.getStudents.mockResolvedValue(
      createPaginatedResponse([
        {
          id: 'student-1',
          first_name: 'John',
          last_name: 'Doe',
          classrooms: [],
          available_bonus_points: 0,
          penalty_count: 0,
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ]),
    )
    mockClassroomService.getClassroomStudents.mockResolvedValue(
      createPaginatedResponse([
        {
          id: 'student-2',
          first_name: 'Jane',
          last_name: 'Doe',
          classrooms: [],
          available_bonus_points: 0,
          penalty_count: 0,
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ]),
    )
    mockTypeService.getBonusTypes.mockResolvedValue(
      createPaginatedResponse([
        {
          id: 'bonus-type-1',
          name: 'Participation',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ]),
    )
    mockTypeService.getPenaltyTypes.mockResolvedValue(
      createPaginatedResponse([
        {
          id: 'penalty-type-1',
          name: 'Late',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ]),
    )
    mockTypeService.getPunishmentTypes.mockResolvedValue(
      createPaginatedResponse([
        {
          id: 'punishment-type-1',
          name: 'Detention',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ]),
    )

    const {
      fetchClassroomOptions,
      fetchStudentOptions,
      fetchBonusTypeOptions,
      fetchPenaltyTypeOptions,
      fetchPunishmentTypeOptions,
    } = useTrackedEntityFilterOptions({
      classroomId,
    })

    expect((await fetchClassroomOptions({ page: 1 })).data).toEqual([{ id: 'class-1', name: '6A' }])
    expect((await fetchStudentOptions({ page: 1 })).data).toEqual([
      { id: 'student-1', name: 'John Doe' },
    ])
    expect(mockStudentService.getStudents).toHaveBeenCalledWith({ page: 1 })

    classroomId.value = 'class-1'
    expect((await fetchStudentOptions({ page: 1, search: 'Jane' })).data).toEqual([
      { id: 'student-2', name: 'Jane Doe' },
    ])
    expect(mockClassroomService.getClassroomStudents).toHaveBeenCalledWith('class-1', {
      page: 1,
      search: 'Jane',
    })

    expect((await fetchBonusTypeOptions({ page: 1 })).data).toEqual([
      { id: 'bonus-type-1', name: 'Participation' },
    ])
    expect((await fetchPenaltyTypeOptions({ page: 1 })).data).toEqual([
      { id: 'penalty-type-1', name: 'Late' },
    ])
    expect((await fetchPunishmentTypeOptions({ page: 1 })).data).toEqual([
      { id: 'punishment-type-1', name: 'Detention' },
    ])
  })
})
