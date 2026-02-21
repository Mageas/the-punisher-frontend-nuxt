import type { Penalty, PaginatedResponse, PenaltyCreateData } from '~/types/api'

export const penaltyService = {
  async getPenalties(options?: { page?: number; search?: string }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Penalty>>('/penalties', { params })
  },

  async createPenalty(data: PenaltyCreateData) {
    const { $api } = useNuxtApp()
    return $api<Penalty>('/penalties', {
      method: 'POST',
      body: data,
    })
  },

  async updatePenalty(penaltyId: string, data: Partial<PenaltyCreateData>) {
    const { $api } = useNuxtApp()
    return $api<Penalty>(`/penalties/${penaltyId}`, {
      method: 'PATCH',
      body: data,
    })
  },

  async deletePenalty(penaltyId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/penalties/${penaltyId}`, {
      method: 'DELETE',
    })
  },
}
