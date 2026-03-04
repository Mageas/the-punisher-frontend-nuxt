import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import { useStudentBonuses } from '../useStudentBonuses'
import { useStudentHistory } from '../useStudentHistory'
import { useStudentPenalties } from '../useStudentPenalties'
import { useStudentPunishments } from '../useStudentPunishments'

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
  getStudentBonuses: vi.fn(),
  getStudentHistory: vi.fn(),
  getStudentPenalties: vi.fn(),
  getStudentPunishments: vi.fn(),
}

const mockBonusService = {
  useBonus: vi.fn(),
  deleteBonus: vi.fn(),
}

const mockPenaltyService = {
  deletePenalty: vi.fn(),
}

const mockPunishmentService = {
  resolvePunishment: vi.fn(),
  deletePunishment: vi.fn(),
}

vi.mock('../services/useStudentService', () => ({
  useStudentService: () => mockStudentService,
}))

vi.mock('../services/useBonusService', () => ({
  useBonusService: () => mockBonusService,
}))

vi.mock('../services/usePenaltyService', () => ({
  usePenaltyService: () => mockPenaltyService,
}))

vi.mock('../services/usePunishmentService', () => ({
  usePunishmentService: () => mockPunishmentService,
}))

function createPaginatedResponse() {
  return {
    data: [],
    page: 1,
    item_per_page: 5,
    total_count: 0,
    next_page: null,
    previous_page: null,
  }
}

describe('student profile section page size', () => {
  beforeEach(() => {
    mockRoute.query = {}
    mockState.clear()
    vi.clearAllMocks()

    mockStudentService.getStudentBonuses.mockResolvedValue(createPaginatedResponse())
    mockStudentService.getStudentHistory.mockResolvedValue(createPaginatedResponse())
    mockStudentService.getStudentPenalties.mockResolvedValue(createPaginatedResponse())
    mockStudentService.getStudentPunishments.mockResolvedValue(createPaginatedResponse())
  })

  it('uses item_per_page=5 for student punishments', async () => {
    const { fetchPunishments } = useStudentPunishments('student-1')
    await fetchPunishments({ page: 2, state: 'pending' })

    expect(mockStudentService.getStudentPunishments).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        page: 2,
        state: 'pending',
        item_per_page: 5,
      }),
    )
  })

  it('uses item_per_page=5 for student bonuses', async () => {
    const { fetchBonuses } = useStudentBonuses('student-1')
    await fetchBonuses({ page: 3, state: 'unused' })

    expect(mockStudentService.getStudentBonuses).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        page: 3,
        state: 'unused',
        item_per_page: 5,
      }),
    )
  })

  it('uses item_per_page=5 for student penalties', async () => {
    const { fetchPenalties } = useStudentPenalties('student-1')
    await fetchPenalties({ page: 4 })

    expect(mockStudentService.getStudentPenalties).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        page: 4,
        item_per_page: 5,
      }),
    )
  })

  it('uses item_per_page=5 for student history', async () => {
    const { fetchHistory } = useStudentHistory('student-1')
    await fetchHistory({ page: 5 })

    expect(mockStudentService.getStudentHistory).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        page: 5,
        item_per_page: 5,
      }),
    )
  })

  it('reads custom section page keys from route query', async () => {
    mockRoute.query = {
      punishments_page: '6',
      history_page: '4',
    }

    const { fetchPunishments } = useStudentPunishments('student-1')
    const { fetchHistory } = useStudentHistory('student-1')

    await fetchPunishments({ state: 'pending' })
    await fetchHistory()

    expect(mockStudentService.getStudentPunishments).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        page: 6,
        state: 'pending',
        item_per_page: 5,
      }),
    )
    expect(mockStudentService.getStudentHistory).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        page: 4,
        item_per_page: 5,
      }),
    )
  })

  it('keeps default student profile states when reading section pages from route query', async () => {
    mockRoute.query = {
      punishments_page: '2',
      bonuses_page: '3',
    }

    const { fetchPunishments } = useStudentPunishments('student-1')
    const { fetchBonuses } = useStudentBonuses('student-1')

    await fetchPunishments()
    await fetchBonuses()

    expect(mockStudentService.getStudentPunishments).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        page: 2,
        state: 'pending',
        item_per_page: 5,
      }),
    )
    expect(mockStudentService.getStudentBonuses).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        page: 3,
        state: 'unused',
        item_per_page: 5,
      }),
    )
  })
})
