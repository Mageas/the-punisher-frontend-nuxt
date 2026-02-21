import type { Punishment, PaginatedResponse, PunishmentCreateData, PunishmentResolveData, $Fetch } from '~/types/api'

export const punishmentService = {
  async getPunishments($api: $Fetch, options?: { page?: number; search?: string; state?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    if (options?.state) params.state = options.state
    return $api<PaginatedResponse<Punishment>>('/punishments', { params })
  },

  async createPunishment($api: $Fetch, data: PunishmentCreateData) {
    return $api<Punishment>('/punishments', {
      method: 'POST',
      body: data,
    })
  },

  async updatePunishment($api: $Fetch, punishmentId: string, data: Partial<PunishmentCreateData>) {
    return $api<Punishment>(`/punishments/${punishmentId}`, {
      method: 'PATCH',
      body: data,
    })
  },

  async deletePunishment($api: $Fetch, punishmentId: string): Promise<void> {
    await $api(`/punishments/${punishmentId}`, {
      method: 'DELETE',
    })
  },

  async resolvePunishment($api: $Fetch, punishmentId: string, data: PunishmentResolveData) {
    return $api<Punishment>(`/punishments/${punishmentId}/resolve`, {
      method: 'POST',
      body: data,
    })
  }
}
