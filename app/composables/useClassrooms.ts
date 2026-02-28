import type { Classroom } from '~/types/api'
/**
 * Composable to fetch and manage classrooms with pagination.
 */
export function useClassrooms() {
  const classroomService = useClassroomService()
  const paginated = usePaginatedCollection<
    Classroom,
    {
      page?: number
    }
  >((options) => classroomService.getClassrooms(options), {
    pageKey: 'page',
    stateKey: 'paginated:classrooms',
  })

  async function fetchClassrooms(options?: { page?: number }) {
    await paginated.fetchPage(options)
  }

  async function createClassroom(data: { name: string; year?: string | null }) {
    return await classroomService.createClassroom(data)
  }

  async function updateClassroom(
    classroomId: string,
    data: { name?: string; year?: string | null },
  ) {
    return await classroomService.updateClassroom(classroomId, data)
  }

  async function deleteClassroom(classroomId: string) {
    return await classroomService.deleteClassroom(classroomId)
  }

  async function deleteAllClassrooms() {
    return await classroomService.deleteAllClassrooms()
  }

  return {
    classrooms: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchClassrooms,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    deleteAllClassrooms,
  }
}
