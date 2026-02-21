import type { DashboardResponse } from '~/types/api'

export const dashboardService = {
  async getDashboard(options?: { classroomId?: string }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}

    if (options?.classroomId) {
      params.classroom_id = options.classroomId
    }

    return $api<DashboardResponse>('/dashboard', { params })
  },
}
