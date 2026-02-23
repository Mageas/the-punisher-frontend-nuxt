import type {
  ApiRequestOptions,
  Punishment,
  PaginatedResponse,
  PunishmentCreateData,
  PunishmentResolveData,
} from '~/types/api'

export function usePunishmentService() {
  const { $api } = useNuxtApp()

  async function getPunishments(
    options?: { page?: number; search?: string; state?: string },
    requestOptions?: ApiRequestOptions,
  ) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    if (options?.state) params.state = options.state
    return $api<PaginatedResponse<Punishment>>('/punishments', { params, ...requestOptions })
  }

  async function createPunishment(data: PunishmentCreateData) {
    return $api<Punishment>('/punishments', {
      method: 'POST',
      body: data,
    })
  }

  async function updatePunishment(punishmentId: string, data: Partial<PunishmentCreateData>) {
    return $api<Punishment>(`/punishments/${punishmentId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  async function deletePunishment(punishmentId: string): Promise<void> {
    await $api(`/punishments/${punishmentId}`, {
      method: 'DELETE',
    })
  }

  async function resolvePunishment(punishmentId: string, data: PunishmentResolveData) {
    return $api<Punishment>(`/punishments/${punishmentId}/resolve`, {
      method: 'POST',
      body: data,
    })
  }

  return {
    getPunishments,
    createPunishment,
    updatePunishment,
    deletePunishment,
    resolvePunishment,
  }
}
