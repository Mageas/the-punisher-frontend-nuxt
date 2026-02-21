import type { Bonus, PaginatedResponse, BonusCreateData, BonusUseData } from '~/types/api'

export const bonusService = {
  /**
   * Fetch all bonuses with pagination.
   */
  async getBonuses(options?: { page?: number; search?: string; state?: string }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    if (options?.state) params.state = options.state
    return $api<PaginatedResponse<Bonus>>('/bonuses', { params })
  },

  /**
   * Create a new bonus.
   */
  async createBonus(data: BonusCreateData) {
    const { $api } = useNuxtApp()
    return $api<Bonus>('/bonuses', {
      method: 'POST',
      body: data,
    })
  },

  /**
   * Update an existing bonus.
   */
  async updateBonus(bonusId: string, data: Partial<BonusCreateData>) {
    const { $api } = useNuxtApp()
    return $api<Bonus>(`/bonuses/${bonusId}`, {
      method: 'PATCH',
      body: data,
    })
  },

  /**
   * Delete a bonus.
   */
  async deleteBonus(bonusId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/bonuses/${bonusId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Use a bonus.
   */
  async useBonus(bonusId: string, data: BonusUseData) {
    const { $api } = useNuxtApp()
    return $api<Bonus>(`/bonuses/${bonusId}/use`, {
      method: 'POST',
      body: data,
    })
  },
}
