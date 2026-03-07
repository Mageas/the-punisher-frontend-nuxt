import { describe, it, expect } from 'vitest'
import { nextTick, ref } from 'vue'
import { readRouteStringQueryParam, useRouteStringQueryParam } from '../useRouteStringQueryParam'

describe('useRouteStringQueryParam', () => {
  it('reads and trims raw query values', () => {
    expect(readRouteStringQueryParam('  token-123  ')).toBe('token-123')
    expect(readRouteStringQueryParam(12)).toBe('')
    expect(readRouteStringQueryParam(null)).toBe('')
  })

  it('tracks reactive query values', async () => {
    const source = ref<unknown>('  confirmed  ')
    const queryParam = useRouteStringQueryParam(source)

    expect(queryParam.value).toBe('confirmed')

    source.value = ' reset '
    await nextTick()

    expect(queryParam.value).toBe('reset')
  })
})
