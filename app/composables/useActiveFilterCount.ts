import type { MaybeRefOrGetter } from 'vue'

function isActiveFilterValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((entry) => isActiveFilterValue(entry))
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return value !== undefined && value !== null && value !== false
}

export function useActiveFilterCount(filters: readonly MaybeRefOrGetter<unknown>[]) {
  return computed(() =>
    filters.reduce<number>(
      (count, filter) => count + (isActiveFilterValue(toValue(filter)) ? 1 : 0),
      0,
    ),
  )
}
