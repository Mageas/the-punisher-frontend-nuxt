import type { Bonus, PaginatedResponse, BonusCreateData, BonusUseData, $Fetch } from '~/types/api'

export const bonusService = {
  /**
   * Fetch all bonuses with pagination.
   */
  async getBonuses($api: $Fetch, options?: { page?: number; search?: string; state?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    if (options?.state) params.state = options.state
    return $api<PaginatedResponse<Bonus>>('/bonuses', { params })
  },

  /**
   * Create a new bonus.
   */
  async createBonus($api: $Fetch, data: BonusCreateData) {
    return $api<Bonus>('/bonuses', {
      method: 'POST',
      body: data,
    })
  },

  /**
   * Update an existing bonus.
   */
  async updateBonus($api: $Fetch, bonusId: string, data: Partial<BonusCreateData>) {
    return $api<Bonus>(`/bonuses/${bonusId}`, {
      method: 'PATCH',
      body: data,
    })
  },

  /**
   * Delete a bonus.
   */
  async deleteBonus($api: $Fetch, bonusId: string): Promise<void> {
    await $api(`/bonuses/${bonusId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Use a bonus.
   */
  async useBonus($api: $Fetch, bonusId: string, data: BonusUseData) {
    return $api<Bonus>(`/bonuses/${bonusId}/use`, {
      method: 'POST',
      body: data,
    })
  }
}
