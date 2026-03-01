import { describe, expect, it } from 'vitest'
import { buildDelta } from '../delta'

describe('delta.ts', () => {
  it('returns only changed fields', () => {
    const initial = { first_name: 'John', last_name: 'Doe' }
    const current = { first_name: 'John', last_name: 'Dupont' }

    expect(buildDelta(initial, current)).toEqual({ last_name: 'Dupont' })
  })

  it('returns an empty object when nothing changed', () => {
    const initial = { name: 'Classe A', year: '2026' }
    const current = { name: 'Classe A', year: '2026' }

    expect(buildDelta(initial, current)).toEqual({})
  })

  it('ignores undefined values in current payload', () => {
    const initial = { name: 'A', year: '2026' }
    const current = { name: 'A', year: undefined }

    expect(buildDelta(initial, current)).toEqual({})
  })

  it('keeps explicit null updates', () => {
    const initial: { year: string | null } = { year: '2026' }
    const current: { year: string | null } = { year: null }

    expect(buildDelta(initial, current)).toEqual({ year: null })
  })
})
