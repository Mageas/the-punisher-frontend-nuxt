import type { BonusType, PenaltyType, PunishmentType, PaginatedResponse } from '~/types/api'

export function useTypeService() {
  const { $api } = useNuxtApp()

  // Bonus Types
  async function getBonusTypes(options?: { page?: number }) {
    return $api<PaginatedResponse<BonusType>>('/bonus-types', {
      params: options,
    })
  }
  async function createBonusType(data: { name: string }) {
    return $api<BonusType>('/bonus-types', { method: 'POST', body: data })
  }
  async function updateBonusType(typeId: string, data: { name: string }) {
    return $api<BonusType>(`/bonus-types/${typeId}`, {
      method: 'PUT',
      body: data,
    })
  }
  async function deleteBonusType(typeId: string): Promise<void> {
    await $api(`/bonus-types/${typeId}`, { method: 'DELETE' })
  }

  // Penalty Types
  async function getPenaltyTypes(options?: { page?: number }) {
    return $api<PaginatedResponse<PenaltyType>>('/penalty-types', {
      params: options,
    })
  }
  async function createPenaltyType(data: { name: string }) {
    return $api<PenaltyType>('/penalty-types', { method: 'POST', body: data })
  }
  async function updatePenaltyType(typeId: string, data: { name: string }) {
    return $api<PenaltyType>(`/penalty-types/${typeId}`, {
      method: 'PUT',
      body: data,
    })
  }
  async function deletePenaltyType(typeId: string): Promise<void> {
    await $api(`/penalty-types/${typeId}`, { method: 'DELETE' })
  }

  // Punishment Types
  async function getPunishmentTypes(options?: { page?: number }) {
    return $api<PaginatedResponse<PunishmentType>>('/punishment-types', {
      params: options,
    })
  }
  async function createPunishmentType(data: { name: string }) {
    return $api<PunishmentType>('/punishment-types', {
      method: 'POST',
      body: data,
    })
  }
  async function updatePunishmentType(typeId: string, data: { name: string }) {
    return $api<PunishmentType>(`/punishment-types/${typeId}`, {
      method: 'PUT',
      body: data,
    })
  }
  async function deletePunishmentType(typeId: string): Promise<void> {
    await $api(`/punishment-types/${typeId}`, { method: 'DELETE' })
  }

  return {
    getBonusTypes,
    createBonusType,
    updateBonusType,
    deleteBonusType,
    getPenaltyTypes,
    createPenaltyType,
    updatePenaltyType,
    deletePenaltyType,
    getPunishmentTypes,
    createPunishmentType,
    updatePunishmentType,
    deletePunishmentType,
  }
}
