import type {
  ApiRequestOptions,
  Punishment,
  PunishmentBulkCreateData,
  PaginatedResponse,
  PunishmentCreateData,
  PunishmentResolveData,
  PunishmentUpdateData,
} from '~/types/api'

export function usePunishmentService() {
  const { $api } = useNuxtApp()

  async function getPunishments(
    options?: {
      page?: number
      item_per_page?: number
      student_id?: string
      classroom_id?: string
      punishment_type_id?: string
      state?: string
      automated?: string
      overdue?: string
      created_from?: string
      created_to?: string
      due_from?: string
      due_to?: string
    },
    requestOptions?: ApiRequestOptions,
  ) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.item_per_page) params.item_per_page = options.item_per_page
    if (options?.student_id) params.student_id = options.student_id
    if (options?.classroom_id) params.classroom_id = options.classroom_id
    if (options?.punishment_type_id) params.punishment_type_id = options.punishment_type_id
    if (options?.state) params.state = options.state
    if (options?.automated) params.automated = options.automated
    if (options?.overdue) params.overdue = options.overdue
    if (options?.created_from) params.created_from = options.created_from
    if (options?.created_to) params.created_to = options.created_to
    if (options?.due_from) params.due_from = options.due_from
    if (options?.due_to) params.due_to = options.due_to
    return $api<PaginatedResponse<Punishment>>('/punishments', { params, ...requestOptions })
  }

  async function createPunishment(data: PunishmentCreateData) {
    return $api<Punishment>('/punishments', {
      method: 'POST',
      body: data,
    })
  }

  async function createBulkPunishments(classroomId: string, data: PunishmentBulkCreateData) {
    return $api<Punishment[]>(`/classrooms/${classroomId}/punishments/bulk`, {
      method: 'POST',
      body: data,
    })
  }

  async function updatePunishment(punishmentId: string, data: PunishmentUpdateData) {
    return $api<Punishment>(`/punishments/${punishmentId}`, {
      method: 'PUT',
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
    createBulkPunishments,
    updatePunishment,
    deletePunishment,
    resolvePunishment,
  }
}
