import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import { useDashboardBonuses } from '../useDashboardBonuses'
import { useDashboardPenalties } from '../useDashboardPenalties'
import { useDashboardPunishments } from '../useDashboardPunishments'

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

const mockBonusService = {
  getBonuses: vi.fn(),
}

const mockPenaltyService = {
  getPenalties: vi.fn(),
}

const mockPunishmentService = {
  getPunishments: vi.fn(),
  resolvePunishment: vi.fn(),
}

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

describe('dashboard sections pagination', () => {
  beforeEach(() => {
    mockRoute.query = {}
    mockState.clear()
    vi.clearAllMocks()

    mockBonusService.getBonuses.mockResolvedValue(createPaginatedResponse())
    mockPenaltyService.getPenalties.mockResolvedValue(createPaginatedResponse())
    mockPunishmentService.getPunishments.mockResolvedValue(createPaginatedResponse())
    mockPunishmentService.resolvePunishment.mockResolvedValue(undefined)
  })

  it('uses student-like defaults and per-section page keys for dashboard fetches', async () => {
    mockRoute.query = {
      punishments_page: '2',
      bonuses_page: '3',
      penalties_page: '4',
    }

    const classroomId = ref('class-1')
    const { fetchPunishments } = useDashboardPunishments(classroomId)
    const { fetchBonuses } = useDashboardBonuses(classroomId)
    const { fetchPenalties } = useDashboardPenalties(classroomId)

    await fetchPunishments()
    await fetchBonuses()
    await fetchPenalties()

    expect(mockPunishmentService.getPunishments).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        state: 'pending',
        classroom_id: 'class-1',
        item_per_page: 5,
      }),
    )
    expect(mockBonusService.getBonuses).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 3,
        state: 'unused',
        classroom_id: 'class-1',
        item_per_page: 5,
      }),
    )
    expect(mockPenaltyService.getPenalties).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 4,
        classroom_id: 'class-1',
        item_per_page: 5,
      }),
    )
  })

  it('syncs dashboard section pagination with student-like query keys', async () => {
    const classroomId = ref('class-1')
    const { gotoPage: gotoPunishmentsPage } = useDashboardPunishments(classroomId)
    const { gotoPage: gotoBonusesPage } = useDashboardBonuses(classroomId)
    const { gotoPage: gotoPenaltiesPage } = useDashboardPenalties(classroomId)

    await gotoPunishmentsPage(2)
    await gotoBonusesPage(3)
    await gotoPenaltiesPage(4)

    expect(mockRouter.push).toHaveBeenNthCalledWith(1, {
      query: { punishments_page: '2' },
    })
    expect(mockRouter.push).toHaveBeenNthCalledWith(2, {
      query: { bonuses_page: '3' },
    })
    expect(mockRouter.push).toHaveBeenNthCalledWith(3, {
      query: { penalties_page: '4' },
    })
  })

  it('uses the current classroom filter for subsequent fetches', async () => {
    const classroomId = ref('class-1')
    const { fetchPunishments } = useDashboardPunishments(classroomId)

    await fetchPunishments()

    classroomId.value = 'class-2'
    await fetchPunishments({ page: 2 })

    expect(mockPunishmentService.getPunishments).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 2,
        state: 'pending',
        classroom_id: 'class-2',
        item_per_page: 5,
      }),
    )
  })
})
