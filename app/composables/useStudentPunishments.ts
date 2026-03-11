import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

type StudentPunishmentsFilters = {
  state?: 'pending' | 'resolved'
  search?: string
}

/**
 * Composable to fetch and manage a student's punishments with pagination.
 */
export function useStudentPunishments(studentId: MaybeRefOrGetter<string>) {
  const punishmentService = usePunishmentService()
  const studentService = useStudentService()
  const PROFILE_SECTION_PAGE_SIZE = 5
  const section = usePunishmentsSection<StudentPunishmentsFilters>({
    source: (options) =>
      studentService.getStudentPunishments(toValue(studentId), {
        ...options,
        item_per_page: PROFILE_SECTION_PAGE_SIZE,
      }),
    filterKeys: ['search', 'state'],
    defaultFilters: { state: 'pending' },
    stateKey: `paginated:student:${toValue(studentId)}:punishments`,
  })

  async function resolvePunishment(id: string) {
    await punishmentService.resolvePunishment(id, {})
  }

  async function deletePunishment(id: string) {
    await punishmentService.deletePunishment(id)
  }

  return {
    ...section,
    resolvePunishment,
    deletePunishment,
  }
}
