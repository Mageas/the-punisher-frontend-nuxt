import type { ApiRequestOptions, Penalty, PaginatedResponse, PenaltyCreateData } from '~/types/api'

export function usePenaltyService() {
  const { $api } = useNuxtApp()

  async function getPenalties(
    options?: {
      page?: number
      student_id?: string
      classroom_id?: string
      penalty_type_id?: string
      created_from?: string
      created_to?: string
    },
    requestOptions?: ApiRequestOptions,
  ) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.student_id) params.student_id = options.student_id
    if (options?.classroom_id) params.classroom_id = options.classroom_id
    if (options?.penalty_type_id) params.penalty_type_id = options.penalty_type_id
    if (options?.created_from) params.created_from = options.created_from
    if (options?.created_to) params.created_to = options.created_to
    return $api<PaginatedResponse<Penalty>>('/penalties', { params, ...requestOptions })
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
