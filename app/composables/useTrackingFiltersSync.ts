import type { Ref } from 'vue'

interface TrackingFiltersSyncOptions<TFilters> {
  filterRefs: readonly Ref<unknown>[]
  buildFilters: () => Partial<TFilters>
  applyFilters: (filters: Partial<TFilters>) => void | Promise<void>
  resetPairs?: ReadonlyArray<{
    source: Ref<unknown>
    target: Ref<string>
  }>
}

export function useTrackingFiltersSync<TFilters>(options: TrackingFiltersSyncOptions<TFilters>) {
  for (const pair of options.resetPairs ?? []) {
    watch(
      () => pair.source.value,
      () => {
        pair.target.value = ''
      },
      {
        flush: 'sync',
      },
    )
  }

  watch(options.filterRefs, () => {
    void options.applyFilters(options.buildFilters())
  })
}
