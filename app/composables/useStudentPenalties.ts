import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

type StudentPenaltiesFilters = {
  search?: string
}

/**
 * Composable to fetch and manage a student's penalties with pagination.
 */
export function useStudentPenalties(studentId: MaybeRefOrGetter<string>) {
  const studentService = useStudentService()
  const penaltyService = usePenaltyService()
  const PROFILE_SECTION_PAGE_SIZE = 5
  const section = usePenaltiesSection<StudentPenaltiesFilters>({
    source: (options) =>
      studentService.getStudentPenalties(toValue(studentId), {
        ...options,
        item_per_page: PROFILE_SECTION_PAGE_SIZE,
      }),
    filterKeys: ['search'],
    stateKey: `paginated:student:${toValue(studentId)}:penalties`,
  })

  async function deletePenalty(id: string) {
    await penaltyService.deletePenalty(id)
  }

  return {
    ...section,
    deletePenalty,
  }
}
