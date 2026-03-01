import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useLazyIdNameOptions, type IdNameOption } from '../useLazyIdNameOptions'

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    refDebounced: <T>(value: T) => value,
  }
})

function createResponse(options: { page: number; nextPage: number | null; data: IdNameOption[] }) {
  return {
    page: options.page,
    item_per_page: 10,
    total_count: 100,
    previous_page: options.page > 1 ? options.page - 1 : null,
    next_page: options.nextPage,
    data: options.data,
  }
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('useLazyIdNameOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns static options when no remote fetcher is provided', async () => {
    const open = ref(false)
    const search = ref('')
    const staticOptions = ref<IdNameOption[]>([
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
    ])

    const options = useLazyIdNameOptions({
      open,
      search,
      staticOptions,
    })

    expect(options.isRemote.value).toBe(false)
    expect(options.options.value).toEqual(staticOptions.value)
    expect(options.getKnownOption('1')?.name).toBe('A')

    open.value = true
    search.value = 'test'
    await flushPromises()

    expect(options.options.value).toEqual(staticOptions.value)
  })

  it('loads first page on open, then appends next page without duplicates', async () => {
    const open = ref(false)
    const search = ref('')

    const fetchOptions = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse({
          page: 1,
          nextPage: 2,
          data: [
            { id: '1', name: 'One' },
            { id: '2', name: 'Two' },
          ],
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          page: 2,
          nextPage: null,
          data: [
            { id: '2', name: 'Two Updated' },
            { id: '3', name: 'Three' },
          ],
        }),
      )

    const options = useLazyIdNameOptions({
      open,
      search,
      staticOptions: [],
      fetchOptions,
    })

    open.value = true
    await flushPromises()

    expect(fetchOptions).toHaveBeenCalledWith({ page: 1, search: undefined })
    expect(options.options.value).toEqual([
      { id: '1', name: 'One' },
      { id: '2', name: 'Two' },
    ])
    expect(options.hasMore.value).toBe(true)

    await options.loadMore()

    expect(fetchOptions).toHaveBeenLastCalledWith({ page: 2, search: undefined })
    expect(options.options.value).toEqual([
      { id: '1', name: 'One' },
      { id: '2', name: 'Two Updated' },
      { id: '3', name: 'Three' },
    ])
    expect(options.hasMore.value).toBe(false)
  })

  it('resets to page 1 when search changes', async () => {
    const open = ref(false)
    const search = ref('')

    const fetchOptions = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse({
          page: 1,
          nextPage: null,
          data: [{ id: '1', name: 'One' }],
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          page: 1,
          nextPage: null,
          data: [{ id: '2', name: 'Two Filtered' }],
        }),
      )

    const options = useLazyIdNameOptions({
      open,
      search,
      staticOptions: [],
      fetchOptions,
    })

    open.value = true
    await flushPromises()
    expect(options.options.value).toEqual([{ id: '1', name: 'One' }])

    search.value = 'tw'
    await flushPromises()

    expect(fetchOptions).toHaveBeenLastCalledWith({ page: 1, search: 'tw' })
    expect(options.options.value).toEqual([{ id: '2', name: 'Two Filtered' }])
  })

  it('ignores stale responses from older requests', async () => {
    const open = ref(false)
    const search = ref('')

    let resolveFirst: ((value: ReturnType<typeof createResponse>) => void) | null = null
    let resolveSecond: ((value: ReturnType<typeof createResponse>) => void) | null = null

    const firstPromise = new Promise<ReturnType<typeof createResponse>>((resolve) => {
      resolveFirst = resolve
    })
    const secondPromise = new Promise<ReturnType<typeof createResponse>>((resolve) => {
      resolveSecond = resolve
    })

    const fetchOptions = vi
      .fn()
      .mockImplementation(({ search: searchParam }: { search?: string }) => {
        if (searchParam) return secondPromise
        return firstPromise
      })

    const options = useLazyIdNameOptions({
      open,
      search,
      staticOptions: [],
      fetchOptions,
    })

    open.value = true
    await flushPromises()

    search.value = 'new'
    await flushPromises()

    expect(resolveSecond).toBeTruthy()
    resolveSecond!(
      createResponse({
        page: 1,
        nextPage: null,
        data: [{ id: '2', name: 'Newest' }],
      }),
    )
    await flushPromises()
    expect(options.options.value).toEqual([{ id: '2', name: 'Newest' }])

    expect(resolveFirst).toBeTruthy()
    resolveFirst!(
      createResponse({
        page: 1,
        nextPage: null,
        data: [{ id: '1', name: 'Oldest' }],
      }),
    )
    await flushPromises()

    expect(options.options.value).toEqual([{ id: '2', name: 'Newest' }])
  })
})
