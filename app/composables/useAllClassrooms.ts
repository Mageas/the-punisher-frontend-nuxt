import type { Classroom, PaginatedResponse } from '~/types/api'

/**
 * Composable to fetch ALL classrooms across all pages.
 */
export function useAllClassrooms() {
  const { $api } = useNuxtApp()

  const classrooms = ref<Classroom[]>([])
  const loading = ref(false)

  async function fetchClassrooms() {
    loading.value = true
    const all: Classroom[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await $api<PaginatedResponse<Classroom>>('/classrooms/', {
        params: { page },
      })
      all.push(...res.data)
      hasMore = res.next_page !== null
      page++
    }

    classrooms.value = all
    loading.value = false
  }

  return {
    classrooms: classrooms as Readonly<Ref<Classroom[]>>,
    loading: readonly(loading),
    fetchClassrooms,
  }
}
