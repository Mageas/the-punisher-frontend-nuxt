import type { Ref } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useAuth } from '../useAuth'

// -- Mock Nuxt Composables --
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

vi.mock('#app/composables/router', () => ({
  navigateTo: vi.fn(),
}))

const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  getRegisterStatus: vi.fn(),
  logout: vi.fn(),
  logoutAll: vi.fn(),
  refresh: vi.fn(),
}

vi.mock('../services/useAuthService', () => ({
  useAuthService: () => mockAuthService,
}))

describe('useAuth', () => {
  beforeEach(() => {
    // Clear mocks state
    mockState.clear()
    mockCookies.clear()
    vi.clearAllMocks()
  })

  it('initializes as not authenticated', () => {
    const { isAuthenticated } = useAuth()
    expect(isAuthenticated.value).toBe(false)
  })

  it('initializes from cookie if present', () => {
    mockCookies.set('access_token', ref('test-token'))
    const { isAuthenticated, accessToken } = useAuth()
    expect(isAuthenticated.value).toBe(true)
    expect(accessToken.value).toBe('test-token')
  })

  it('logs in successfully and sets token', async () => {
    mockAuthService.login.mockResolvedValue({ access_token: 'new-token' })
    const { login, isAuthenticated, accessToken } = useAuth()

    await login('test@example.com', 'password')

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password')
    expect(accessToken.value).toBe('new-token')
    expect(isAuthenticated.value).toBe(true)
    expect(mockCookies.get('access_token')?.value).toBe('new-token')
  })

  it('logs out and clears token', async () => {
    mockCookies.set('access_token', ref('old-token'))
    const { logout, isAuthenticated, accessToken } = useAuth()

    await logout()

    expect(mockAuthService.logout).toHaveBeenCalled()
    expect(accessToken.value).toBe(null)
    expect(isAuthenticated.value).toBe(false)
    expect(mockCookies.get('access_token')?.value).toBe(null)
  })

  it('logs out all devices and clears token', async () => {
    mockCookies.set('access_token', ref('old-token'))
    const { logoutAll, isAuthenticated, accessToken } = useAuth()

    await logoutAll()

    expect(mockAuthService.logoutAll).toHaveBeenCalled()
    expect(accessToken.value).toBe(null)
    expect(isAuthenticated.value).toBe(false)
    expect(mockCookies.get('access_token')?.value).toBe(null)
  })

  it('refreshes token successfully', async () => {
    mockAuthService.refresh.mockResolvedValue({ access_token: 'refreshed-token' })
    const { refresh, accessToken } = useAuth()

    const result = await refresh()

    expect(result).toBe(true)
    expect(accessToken.value).toBe('refreshed-token')
  })

  it('fails refresh gracefully', async () => {
    mockAuthService.refresh.mockRejectedValue(new Error('Refresh failed'))
    const { refresh, accessToken, isAuthenticated } = useAuth()

    const result = await refresh()

    expect(result).toBe(false)
    expect(accessToken.value).toBe(null)
    expect(isAuthenticated.value).toBe(false)
  })

  it('reads registration availability status', async () => {
    mockAuthService.getRegisterStatus.mockResolvedValue({ register_allowed: false })
    const { isRegisterAllowed } = useAuth()

    const result = await isRegisterAllowed()

    expect(mockAuthService.getRegisterStatus).toHaveBeenCalled()
    expect(result).toBe(false)
  })
})
