import type { DashboardResponse } from '~/types/api'

export function useDashboardService() {
  const { $api } = useNuxtApp()

  async function getDashboard(options?: { classroomId?: string }) {
    const params: Record<string, unknown> = {}

    if (options?.classroomId) {
      params.classroom_id = options.classroomId
    }

    return $api<DashboardResponse>('/dashboard', { params })
  }

  return {
    getDashboard,
  }
}
