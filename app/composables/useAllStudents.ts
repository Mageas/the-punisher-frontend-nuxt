import type { PaginatedResponse, Student } from '~/types/api'

/**
 * Composable to fetch ALL students across all pages.
 * Optionally filtered by classroom ID.
 */
export function useAllStudents() {
  const { $api } = useNuxtApp()

  const students = ref<Student[]>([])
  const loading = ref(false)

  async function fetchStudents(classroomId?: string) {
    loading.value = true
    const all: Student[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const url = classroomId
        ? `/classrooms/${classroomId}/students`
        : '/students/'
      const res = await $api<PaginatedResponse<Student>>(url, {
        params: { page },
      })
      all.push(...res.data)
      hasMore = res.next_page !== null
      page++
    }

    students.value = all
    loading.value = false
  }

  return {
    students: students as Readonly<Ref<Student[]>>,
    loading: readonly(loading),
    fetchStudents,
  }
}
