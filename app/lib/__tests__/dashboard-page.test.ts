import { describe, it, expect, vi } from 'vitest'
import {
  createLatestOnlyAsyncRunner,
  getDashboardSectionPageResetQuery,
  reloadDashboardSectionsOnClassroomChange,
  resetDashboardSectionPageOnCreate,
} from '../dashboard-page'

describe('dashboard-page.ts', () => {
  it('returns only the latest resolved value', async () => {
    const resolvers = new Map<number, (value: number) => void>()
    const runLatest = createLatestOnlyAsyncRunner<number>()

    const firstRequest = runLatest(
      () =>
        new Promise((resolve) => {
          resolvers.set(1, resolve)
        }),
    )
    const secondRequest = runLatest(
      () =>
        new Promise((resolve) => {
          resolvers.set(2, resolve)
        }),
    )

    resolvers.get(2)?.(2)
    await expect(secondRequest).resolves.toBe(2)

    resolvers.get(1)?.(1)
    await expect(firstRequest).resolves.toBeUndefined()
  })

  it('ignores stale rejections once a newer request has started', async () => {
    let rejectFirstRequest: ((reason?: unknown) => void) | undefined
    let resolveSecondRequest: ((value: number) => void) | undefined
    const runLatest = createLatestOnlyAsyncRunner<number>()

    const firstRequest = runLatest(
      () =>
        new Promise((_, reject) => {
          rejectFirstRequest = reject
        }),
    )
    const secondRequest = runLatest(
      () =>
        new Promise((resolve) => {
          resolveSecondRequest = resolve
        }),
    )

    rejectFirstRequest?.(new Error('stale'))
    resolveSecondRequest?.(2)

    await expect(secondRequest).resolves.toBe(2)
    await expect(firstRequest).resolves.toBeUndefined()
  })

  it('resets only the created section when it is past page 1', async () => {
    const gotoPage = {
      bonuses: vi.fn().mockResolvedValue(undefined),
      penalties: vi.fn().mockResolvedValue(undefined),
      punishments: vi.fn().mockResolvedValue(undefined),
    }

    const didReset = await resetDashboardSectionPageOnCreate(
      'penalties',
      {
        bonuses: 3,
        penalties: 2,
        punishments: 4,
      },
      gotoPage,
    )

    expect(didReset).toBe(true)
    expect(gotoPage.penalties).toHaveBeenCalledWith(1)
    expect(gotoPage.bonuses).not.toHaveBeenCalled()
    expect(gotoPage.punishments).not.toHaveBeenCalled()
  })

  it('keeps the current section page when it is already on page 1', async () => {
    const gotoPage = {
      bonuses: vi.fn().mockResolvedValue(undefined),
      penalties: vi.fn().mockResolvedValue(undefined),
      punishments: vi.fn().mockResolvedValue(undefined),
    }

    const didReset = await resetDashboardSectionPageOnCreate(
      'bonuses',
      {
        bonuses: 1,
        penalties: 2,
        punishments: 3,
      },
      gotoPage,
    )

    expect(didReset).toBe(false)
    expect(gotoPage.bonuses).not.toHaveBeenCalled()
    expect(gotoPage.penalties).not.toHaveBeenCalled()
    expect(gotoPage.punishments).not.toHaveBeenCalled()
  })

  it('removes dashboard section page params when the classroom changes', () => {
    const resetQuery = getDashboardSectionPageResetQuery({
      punishments_page: '2',
      bonuses_page: '3',
      penalties_page: '4',
      search: 'alice',
    })

    expect(resetQuery).toEqual({
      search: 'alice',
    })
  })

  it('returns nothing when no dashboard section page param needs reset', () => {
    const resetQuery = getDashboardSectionPageResetQuery({
      search: 'alice',
    })

    expect(resetQuery).toBeUndefined()
  })

  it('reloads all dashboard sections on page 1 before clearing section query params', async () => {
    const calls: string[] = []
    const loadAllData = vi.fn().mockImplementation(async () => {
      calls.push('loadAllData')
    })
    const replaceQuery = vi.fn().mockImplementation(async () => {
      calls.push('replaceQuery')
    })

    await reloadDashboardSectionsOnClassroomChange({
      classroomId: 'class-2',
      query: {
        punishments_page: '2',
        bonuses_page: '3',
        penalties_page: '4',
        search: 'alice',
      },
      loadAllData,
      replaceQuery,
    })

    expect(loadAllData).toHaveBeenCalledWith({
      classroomId: 'class-2',
      bonusesPage: 1,
      penaltiesPage: 1,
      punishmentsPage: 1,
    })
    expect(replaceQuery).toHaveBeenCalledWith({
      search: 'alice',
    })
    expect(calls).toEqual(['loadAllData', 'replaceQuery'])
  })

  it('still reloads all dashboard sections on page 1 when no query cleanup is needed', async () => {
    const loadAllData = vi.fn().mockResolvedValue(undefined)
    const replaceQuery = vi.fn().mockResolvedValue(undefined)

    await reloadDashboardSectionsOnClassroomChange({
      classroomId: 'class-2',
      query: {
        search: 'alice',
      },
      loadAllData,
      replaceQuery,
    })

    expect(loadAllData).toHaveBeenCalledWith({
      classroomId: 'class-2',
      bonusesPage: 1,
      penaltiesPage: 1,
      punishmentsPage: 1,
    })
    expect(replaceQuery).not.toHaveBeenCalled()
  })
})
