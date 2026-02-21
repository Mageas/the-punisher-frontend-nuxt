import type { Bonus, PaginatedResponse, BonusCreateData, BonusUseData } from '~/types/api'

export function useBonusService() {
  const { $api } = useNuxtApp()

  /**
   * Fetch all bonuses with pagination.
   */
  async function getBonuses(options?: { page?: number; search?: string; state?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    if (options?.state) params.state = options.state
    return $api<PaginatedResponse<Bonus>>('/bonuses', { params })
  }

  /**
   * Create a new bonus.
   */
  async function createBonus(data: BonusCreateData) {
    return $api<Bonus>('/bonuses', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Update an existing bonus.
   */
  async function updateBonus(bonusId: string, data: Partial<BonusCreateData>) {
    return $api<Bonus>(`/bonuses/${bonusId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  /**
   * Delete a bonus.
   */
  async function deleteBonus(bonusId: string): Promise<void> {
    await $api(`/bonuses/${bonusId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Use a bonus.
   */
  async function useBonus(bonusId: string, data: BonusUseData) {
    return $api<Bonus>(`/bonuses/${bonusId}/use`, {
      method: 'POST',
      body: data,
    })
  }

  return {
    getBonuses,
    createBonus,
    updateBonus,
    deleteBonus,
    useBonus,
  }
}
