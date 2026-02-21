import type { Penalty, PaginatedResponse, PenaltyCreateData, $Fetch } from '~/types/api'

export const penaltyService = {
  async getPenalties($api: $Fetch, options?: { page?: number; search?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Penalty>>('/penalties', { params })
  },

  async createPenalty($api: $Fetch, data: PenaltyCreateData) {
    return $api<Penalty>('/penalties', {
      method: 'POST',
      body: data,
    })
  },

  async updatePenalty($api: $Fetch, penaltyId: string, data: Partial<PenaltyCreateData>) {
    return $api<Penalty>(`/penalties/${penaltyId}`, {
      method: 'PATCH',
      body: data,
    })
  },

  async deletePenalty($api: $Fetch, penaltyId: string): Promise<void> {
    await $api(`/penalties/${penaltyId}`, {
      method: 'DELETE',
    })
  }
}
