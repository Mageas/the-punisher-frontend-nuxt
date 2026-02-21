import type { BonusType, PenaltyType, PunishmentType, PaginatedResponse } from '~/types/api'

export const typeService = {
  // Bonus Types
  async getBonusTypes(options?: { page?: number }) {
    const { $api } = useNuxtApp()
    return $api<PaginatedResponse<BonusType>>('/bonus-types', {
      params: options,
    })
  },
  async createBonusType(data: { name: string }) {
    const { $api } = useNuxtApp()
    return $api<BonusType>('/bonus-types', { method: 'POST', body: data })
  },
  async updateBonusType(typeId: string, data: { name: string }) {
    const { $api } = useNuxtApp()
    return $api<BonusType>(`/bonus-types/${typeId}`, {
      method: 'PUT',
      body: data,
    })
  },
  async deleteBonusType(typeId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/bonus-types/${typeId}`, { method: 'DELETE' })
  },

  // Penalty Types
  async getPenaltyTypes(options?: { page?: number }) {
    const { $api } = useNuxtApp()
    return $api<PaginatedResponse<PenaltyType>>('/penalty-types', {
      params: options,
    })
  },
  async createPenaltyType(data: { name: string }) {
    const { $api } = useNuxtApp()
    return $api<PenaltyType>('/penalty-types', { method: 'POST', body: data })
  },
  async updatePenaltyType(typeId: string, data: { name: string }) {
    const { $api } = useNuxtApp()
    return $api<PenaltyType>(`/penalty-types/${typeId}`, {
      method: 'PUT',
      body: data,
    })
  },
  async deletePenaltyType(typeId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/penalty-types/${typeId}`, { method: 'DELETE' })
  },

  // Punishment Types
  async getPunishmentTypes(options?: { page?: number }) {
    const { $api } = useNuxtApp()
    return $api<PaginatedResponse<PunishmentType>>('/punishment-types', {
      params: options,
    })
  },
  async createPunishmentType(data: { name: string }) {
    const { $api } = useNuxtApp()
    return $api<PunishmentType>('/punishment-types', {
      method: 'POST',
      body: data,
    })
  },
  async updatePunishmentType(typeId: string, data: { name: string }) {
    const { $api } = useNuxtApp()
    return $api<PunishmentType>(`/punishment-types/${typeId}`, {
      method: 'PUT',
      body: data,
    })
  },
  async deletePunishmentType(typeId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/punishment-types/${typeId}`, { method: 'DELETE' })
  },
}
