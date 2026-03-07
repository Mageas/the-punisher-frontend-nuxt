import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { navigateTo } from '#app/composables/router'
import { useGuestOnlyPage } from '../useGuestOnlyPage'

const mockAuth = {
  isAuthenticated: ref(false),
}

vi.mock('#app/composables/router', () => ({
  navigateTo: vi.fn(),
}))

vi.mock('../useAuth', () => ({
  useAuth: () => mockAuth,
}))

describe('useGuestOnlyPage', () => {
  beforeEach(() => {
    mockAuth.isAuthenticated.value = false
    vi.clearAllMocks()
  })

  it('does not redirect guests', async () => {
    await useGuestOnlyPage()

    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('redirects authenticated users to the requested path', async () => {
    mockAuth.isAuthenticated.value = true

    await useGuestOnlyPage('/dashboard')

    expect(navigateTo).toHaveBeenCalledWith('/dashboard')
  })
})
