import { refDebounced } from '@vueuse/core'
import { computed, readonly, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import type { PaginatedResponse } from '~/types/api'

export interface IdNameOption {
  id: string
  name: string
}

export type IdNameOptionsFetcher = (options: {
  page: number
  search?: string
}) => Promise<PaginatedResponse<IdNameOption>>

interface UseLazyIdNameOptionsOptions {
  open: Ref<boolean>
  search: Ref<string>
  staticOptions: MaybeRefOrGetter<readonly IdNameOption[]>
  fetchOptions?: IdNameOptionsFetcher
  optionsScopeKey?: MaybeRefOrGetter<unknown>
  searchDebounceMs?: number
}

function normalizeSearch(value: string): string {
  return value.trim()
}

function dedupeById(options: readonly IdNameOption[]): IdNameOption[] {
  const byId = new Map<string, IdNameOption>()
  for (const option of options) {
    byId.set(option.id, option)
  }
  return Array.from(byId.values())
}

function mergeById(
  current: readonly IdNameOption[],
  incoming: readonly IdNameOption[],
): IdNameOption[] {
  return dedupeById([...current, ...incoming])
}

export function useLazyIdNameOptions(options: UseLazyIdNameOptionsOptions) {
  const isRemote = computed(() => typeof options.fetchOptions === 'function')
  const debouncedSearch = refDebounced(options.search, options.searchDebounceMs ?? 300)

  const remoteOptions = ref<IdNameOption[]>([])
  const nextPage = ref<number | null>(null)
  const loadedSearch = ref<string | null>(null)
  const pendingSearch = ref<string | null>(null)
  const loadingInitial = ref(false)
  const loadingMore = ref(false)
  const knownOptionsById = ref<Record<string, IdNameOption>>({})
  let latestRequestId = 0

  const currentOptions = computed<IdNameOption[]>(() => {
    if (isRemote.value) return remoteOptions.value
    return [...toValue(options.staticOptions)]
  })

  function appendKnownOptions(newOptions: readonly IdNameOption[]) {
    if (newOptions.length === 0) return

    const nextKnown = { ...knownOptionsById.value }
    for (const option of newOptions) {
      nextKnown[option.id] = option
    }
    knownOptionsById.value = nextKnown
  }

  function getKnownOption(optionId: string): IdNameOption | undefined {
    return knownOptionsById.value[optionId]
  }

  async function loadFirstPage(rawSearch?: string, force = false) {
    if (!isRemote.value || !options.fetchOptions) return

    const normalizedSearch = normalizeSearch((rawSearch ?? debouncedSearch.value) || '')
    if (
      !force &&
      (loadedSearch.value === normalizedSearch || pendingSearch.value === normalizedSearch)
    ) {
      return
    }

    const requestId = ++latestRequestId
    loadingInitial.value = true
    loadingMore.value = false
    pendingSearch.value = normalizedSearch

    try {
      const response = await options.fetchOptions({
        page: 1,
        search: normalizedSearch || undefined,
      })

      if (requestId !== latestRequestId) return

      const deduped = dedupeById(response.data)
      remoteOptions.value = deduped
      appendKnownOptions(deduped)
      nextPage.value = response.next_page
      loadedSearch.value = normalizedSearch
    } finally {
      if (requestId === latestRequestId) {
        loadingInitial.value = false
        pendingSearch.value = null
      }
    }
  }

  async function loadMore() {
    if (!isRemote.value || !options.fetchOptions) return
    if (loadingInitial.value || loadingMore.value || nextPage.value === null) return

    const requestId = ++latestRequestId
    const pageToLoad = nextPage.value
    const normalizedSearch = normalizeSearch(debouncedSearch.value || '')
    loadingMore.value = true

    try {
      const response = await options.fetchOptions({
        page: pageToLoad,
        search: normalizedSearch || undefined,
      })

      if (requestId !== latestRequestId) return

      const deduped = dedupeById(response.data)
      remoteOptions.value = mergeById(remoteOptions.value, deduped)
      appendKnownOptions(deduped)
      nextPage.value = response.next_page
      loadedSearch.value = normalizedSearch
    } finally {
      if (requestId === latestRequestId) {
        loadingMore.value = false
      }
    }
  }

  function resetRemoteState() {
    latestRequestId += 1
    remoteOptions.value = []
    nextPage.value = null
    loadedSearch.value = null
    pendingSearch.value = null
    loadingInitial.value = false
    loadingMore.value = false
  }

  watch(
    () => toValue(options.staticOptions),
    (newOptions) => {
      appendKnownOptions(newOptions)
    },
    { immediate: true },
  )

  watch(
    () => toValue(options.optionsScopeKey),
    () => {
      if (!isRemote.value) return

      resetRemoteState()
      if (options.open.value) {
        void loadFirstPage(options.search.value, true)
      }
    },
  )

  watch(
    () => options.open.value,
    (isOpen) => {
      if (!isOpen || !isRemote.value) return
      void loadFirstPage(options.search.value, false)
    },
  )

  watch(debouncedSearch, (newSearch, oldSearch) => {
    if (!isRemote.value || !options.open.value) return
    if (normalizeSearch(newSearch || '') === normalizeSearch(oldSearch || '')) return

    void loadFirstPage(newSearch, false)
  })

  return {
    isRemote: readonly(isRemote),
    options: readonly(currentOptions),
    loadingInitial: readonly(loadingInitial),
    loadingMore: readonly(loadingMore),
    hasMore: computed(() => nextPage.value !== null),
    getKnownOption,
    loadMore,
    refresh: () => loadFirstPage(undefined, true),
  }
}
