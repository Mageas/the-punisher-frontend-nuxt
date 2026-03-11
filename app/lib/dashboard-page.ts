import type { LocationQuery, LocationQueryRaw } from 'vue-router'

export type DashboardSectionKey = 'bonuses' | 'penalties' | 'punishments'

type AsyncTask<T> = () => Promise<T>

type DashboardSectionPages = Record<DashboardSectionKey, number>
type DashboardSectionGotoPage = Record<DashboardSectionKey, (page: number) => Promise<void>>
type DashboardSectionLoadOptions = {
  classroomId?: string
  bonusesPage?: number
  penaltiesPage?: number
  punishmentsPage?: number
}
type DashboardSectionReload = (options: DashboardSectionLoadOptions) => Promise<void>
type DashboardQueryReplace = (query: LocationQueryRaw) => Promise<unknown>

const dashboardSectionPageKeys: Record<DashboardSectionKey, string> = {
  bonuses: 'bonuses_page',
  penalties: 'penalties_page',
  punishments: 'punishments_page',
}

export function createLatestOnlyAsyncRunner<T>() {
  let latestRequestId = 0

  return async function run(task: AsyncTask<T>): Promise<T | undefined> {
    const requestId = ++latestRequestId

    try {
      const result = await task()

      if (requestId !== latestRequestId) {
        return undefined
      }

      return result
    } catch (error: unknown) {
      if (requestId !== latestRequestId) {
        return undefined
      }

      throw error
    }
  }
}

export async function resetDashboardSectionPageOnCreate(
  section: DashboardSectionKey,
  pages: DashboardSectionPages,
  gotoPage: DashboardSectionGotoPage,
) {
  if (pages[section] <= 1) {
    return false
  }

  await gotoPage[section](1)
  return true
}

export function getDashboardSectionPageResetQuery(
  query: LocationQuery,
): LocationQueryRaw | undefined {
  const nextQuery: LocationQueryRaw = { ...query }
  let didReset = false

  for (const pageKey of Object.values(dashboardSectionPageKeys)) {
    if (pageKey in nextQuery) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete nextQuery[pageKey]
      didReset = true
    }
  }

  return didReset ? nextQuery : undefined
}

export async function reloadDashboardSectionsOnClassroomChange(options: {
  classroomId?: string
  query: LocationQuery
  loadAllData: DashboardSectionReload
  replaceQuery: DashboardQueryReplace
}) {
  await options.loadAllData({
    classroomId: options.classroomId,
    bonusesPage: 1,
    penaltiesPage: 1,
    punishmentsPage: 1,
  })

  const resetQuery = getDashboardSectionPageResetQuery(options.query)

  if (resetQuery) {
    await options.replaceQuery(resetQuery)
  }
}
