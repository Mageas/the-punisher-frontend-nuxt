import type { Ref } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import authMiddleware from '../auth.global'

import { navigateTo } from '#app/composables/router'

// -- Mocks --
const mockState = new Map<string, Ref<unknown>>()
const mockCookies = new Map<string, Ref<unknown>>()

vi.mock('#app/composables/state', () => ({
  useState: (key: string, init: () => unknown) => {
    if (!mockState.has(key)) mockState.set(key, ref(init()))
    return mockState.get(key)
  },
}))

vi.mock('#app/composables/cookie', () => ({
  useCookie: (key: string) => {
    if (!mockCookies.has(key)) mockCookies.set(key, ref(null))
    return mockCookies.get(key)
  },
}))

const mockAuth = {
  isAuthenticated: ref(false),
  refresh: vi.fn(),
}

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => mockAuth,
}))

vi.mock('#app/composables/router', () => ({
  navigateTo: vi.fn((to: string) => to),
  defineNuxtRouteMiddleware: (fn: (to: RouteLocationNormalized) => unknown) => fn,
}))

describe('auth.global middleware', () => {
  beforeEach(() => {
    mockState.clear()
    mockCookies.clear()
    mockAuth.isAuthenticated.value = false
    mockAuth.refresh.mockReset()
    vi.clearAllMocks()
  })

  it('allows access to pages with auth: false', async () => {
    const to = { meta: { auth: false } } as unknown as RouteLocationNormalized
    const result = await (authMiddleware as (to: RouteLocationNormalized) => Promise<unknown>)(to)
    expect(result).toBeUndefined() // Allowed
  })

  it('redirects to /login if not authenticated and refresh fails', async () => {
    const to = { meta: {} } as unknown as RouteLocationNormalized
    mockAuth.refresh.mockResolvedValue(false)

    const result = await (authMiddleware as (to: RouteLocationNormalized) => Promise<unknown>)(to)

    expect(mockAuth.refresh).toHaveBeenCalled()
    expect(navigateTo).toHaveBeenCalledWith('/login')
    expect(result).toBe('/login')
  })

  it('allows access if already authenticated', async () => {
    const to = { meta: {} } as unknown as RouteLocationNormalized
    mockAuth.isAuthenticated.value = true

    const result = await (authMiddleware as (to: RouteLocationNormalized) => Promise<unknown>)(to)

    expect(result).toBeUndefined()
    expect(mockAuth.refresh).not.toHaveBeenCalled()
  })

  it('allows access if refresh succeeds', async () => {
    const to = { meta: {} } as unknown as RouteLocationNormalized
    mockAuth.refresh.mockResolvedValue(true)

    const result = await (authMiddleware as (to: RouteLocationNormalized) => Promise<unknown>)(to)

    expect(mockAuth.refresh).toHaveBeenCalled()
    expect(result).toBeUndefined()
  })

  it('handles expired token by clearing it', async () => {
    // Generate a dummy JWT that is expired (exp in the past)
    // Payload: { exp: 1000 }
    const expiredToken =
      'header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 })) + '.signature'

    mockState.set('auth.access-token', ref(expiredToken))
    const to = { meta: {} } as unknown as RouteLocationNormalized
    mockAuth.refresh.mockResolvedValue(false)

    await (authMiddleware as (to: RouteLocationNormalized) => Promise<unknown>)(to)

    expect(mockState.get('auth.access-token')?.value).toBeNull()
  })
})
