export type DashboardSectionKey = 'bonuses' | 'penalties' | 'punishments'

type AsyncTask<T> = () => Promise<T>

type DashboardSectionPages = Record<DashboardSectionKey, number>
type DashboardSectionGotoPage = Record<DashboardSectionKey, (page: number) => Promise<void>>

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
