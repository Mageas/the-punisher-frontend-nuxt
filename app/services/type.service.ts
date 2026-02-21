import type { BonusType, PenaltyType, PunishmentType, PaginatedResponse, $Fetch } from '~/types/api'

export const typeService = {
  // Bonus Types
  async getBonusTypes($api: $Fetch, options?: { page?: number }) {
    return $api<PaginatedResponse<BonusType>>('/bonus-types', { params: options })
  },
  async createBonusType($api: $Fetch, data: { name: string }) {
    return $api<BonusType>('/bonus-types', { method: 'POST', body: data })
  },
  async updateBonusType($api: $Fetch, typeId: string, data: { name: string }) {
    return $api<BonusType>(`/bonus-types/${typeId}`, { method: 'PUT', body: data })
  },
  async deleteBonusType($api: $Fetch, typeId: string): Promise<void> {
    await $api(`/bonus-types/${typeId}`, { method: 'DELETE' })
  },

  // Penalty Types
  async getPenaltyTypes($api: $Fetch, options?: { page?: number }) {
    return $api<PaginatedResponse<PenaltyType>>('/penalty-types', { params: options })
  },
  async createPenaltyType($api: $Fetch, data: { name: string }) {
    return $api<PenaltyType>('/penalty-types', { method: 'POST', body: data })
  },
  async updatePenaltyType($api: $Fetch, typeId: string, data: { name: string }) {
    return $api<PenaltyType>(`/penalty-types/${typeId}`, { method: 'PUT', body: data })
  },
  async deletePenaltyType($api: $Fetch, typeId: string): Promise<void> {
    await $api(`/penalty-types/${typeId}`, { method: 'DELETE' })
  },

  // Punishment Types
  async getPunishmentTypes($api: $Fetch, options?: { page?: number }) {
    return $api<PaginatedResponse<PunishmentType>>('/punishment-types', { params: options })
  },
  async createPunishmentType($api: $Fetch, data: { name: string }) {
    return $api<PunishmentType>('/punishment-types', { method: 'POST', body: data })
  },
  async updatePunishmentType($api: $Fetch, typeId: string, data: { name: string }) {
    return $api<PunishmentType>(`/punishment-types/${typeId}`, { method: 'PUT', body: data })
  },
  async deletePunishmentType($api: $Fetch, typeId: string): Promise<void> {
    await $api(`/punishment-types/${typeId}`, { method: 'DELETE' })
  }
}
