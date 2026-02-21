import type { Penalty, PaginatedResponse, PenaltyCreateData } from '~/types/api'

export function usePenaltyService() {
  const { $api } = useNuxtApp()

  async function getPenalties(options?: { page?: number; search?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Penalty>>('/penalties', { params })
  }

  async function createPenalty(data: PenaltyCreateData) {
    return $api<Penalty>('/penalties', {
      method: 'POST',
      body: data,
    })
  }

  async function updatePenalty(penaltyId: string, data: Partial<PenaltyCreateData>) {
    return $api<Penalty>(`/penalties/${penaltyId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  async function deletePenalty(penaltyId: string): Promise<void> {
    await $api(`/penalties/${penaltyId}`, {
      method: 'DELETE',
    })
  }

  return {
    getPenalties,
    createPenalty,
    updatePenalty,
    deletePenalty,
  }
}
