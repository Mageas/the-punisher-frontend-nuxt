export function pickStableFilters<T extends Record<string, unknown>>(
  filters: T,
  allowedKeys: string[],
): Partial<T> {
  const stable: Partial<T> = {}
  for (const key of allowedKeys) {
    if (key in filters && filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      stable[key as keyof T] = filters[key as keyof T]
    }
  }
  return stable
}

export function serializeStableFilters(filters: Record<string, unknown>): string {
  const sortedKeys = Object.keys(filters).sort()
  if (sortedKeys.length === 0) return ''
  
  const parts = sortedKeys.map(key => `${key}=${String(filters[key])}`)
  return parts.join('&')
}

export function buildPageKey(
  resource: string,
  page: number,
  stableFilters: Record<string, unknown>,
): string {
  const filterString = serializeStableFilters(stableFilters)
  if (!filterString) {
    return `${resource}:page=${page}`
  }
  return `${resource}:page=${page}:${filterString}`
}

export function isFresh(fetchedAt: number, staleTimeMs: number): boolean {
  return Date.now() - fetchedAt < staleTimeMs
}
