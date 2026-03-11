import type {
  ApiRequestOptions,
  Bonus,
  PaginatedResponse,
  BonusCreateData,
  BonusUseData,
  BonusUpdateData,
} from '~/types/api'

export function useBonusService() {
  const { $api } = useNuxtApp()

  /**
   * Fetch all bonuses with pagination.
   */
  async function getBonuses(
    options?: {
      page?: number
      item_per_page?: number
      student_id?: string
      classroom_id?: string
      bonus_type_id?: string
      state?: string
      created_from?: string
      created_to?: string
    },
    requestOptions?: ApiRequestOptions,
  ) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.item_per_page) params.item_per_page = options.item_per_page
    if (options?.student_id) params.student_id = options.student_id
    if (options?.classroom_id) params.classroom_id = options.classroom_id
    if (options?.bonus_type_id) params.bonus_type_id = options.bonus_type_id
    if (options?.state) params.state = options.state
    if (options?.created_from) params.created_from = options.created_from
    if (options?.created_to) params.created_to = options.created_to
    return $api<PaginatedResponse<Bonus>>('/bonuses', { params, ...requestOptions })
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
  async function updateBonus(bonusId: string, data: BonusUpdateData) {
    return $api<Bonus>(`/bonuses/${bonusId}`, {
      method: 'PUT',
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
