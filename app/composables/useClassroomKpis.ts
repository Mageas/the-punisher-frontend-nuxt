import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { DashboardKpis } from '~/types/api'

/**
 * Composable to fetch KPI counters for a classroom.
 */
export function useClassroomKpis(classroomId: MaybeRefOrGetter<string>) {
  const classroomService = useClassroomService()
  const kpis = ref<DashboardKpis | null>(null)
  const loading = ref(false)
  const error = ref<unknown | null>(null)

  async function fetchKpis() {
    loading.value = true
    error.value = null

    try {
      kpis.value = await classroomService.getClassroomKpis(toValue(classroomId))
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    kpis,
    loading,
    error,
    fetchKpis,
  }
}
