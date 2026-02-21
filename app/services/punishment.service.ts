import type {
  Punishment,
  PaginatedResponse,
  PunishmentCreateData,
  PunishmentResolveData,
} from '~/types/api'

export const punishmentService = {
  async getPunishments(options?: { page?: number; search?: string; state?: string }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    if (options?.state) params.state = options.state
    return $api<PaginatedResponse<Punishment>>('/punishments', { params })
  },

  async createPunishment(data: PunishmentCreateData) {
    const { $api } = useNuxtApp()
    return $api<Punishment>('/punishments', {
      method: 'POST',
      body: data,
    })
  },

  async updatePunishment(punishmentId: string, data: Partial<PunishmentCreateData>) {
    const { $api } = useNuxtApp()
    return $api<Punishment>(`/punishments/${punishmentId}`, {
      method: 'PATCH',
      body: data,
    })
  },

  async deletePunishment(punishmentId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/punishments/${punishmentId}`, {
      method: 'DELETE',
    })
  },

  async resolvePunishment(punishmentId: string, data: PunishmentResolveData) {
    const { $api } = useNuxtApp()
    return $api<Punishment>(`/punishments/${punishmentId}/resolve`, {
      method: 'POST',
      body: data,
    })
  },
}
