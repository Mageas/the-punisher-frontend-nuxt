import type { Classroom } from '~/types/api'
import { classroomService } from '~/services/classroom.service'

/**
 * Composable to fetch and manage classrooms with pagination.
 */
export function useClassrooms() {
  const paginated = usePaginatedCollection<
    Classroom,
    {
      page?: number
    }
  >((options) => classroomService.getClassrooms(options))

  async function fetchClassrooms(options?: { page?: number }) {
    await paginated.fetchPage(options)
  }

  async function createClassroom(data: { name: string; year?: string | null }) {
    return await classroomService.createClassroom(data)
  }

  async function updateClassroom(classroomId: string, data: { name?: string; year?: string | null }) {
    return await classroomService.updateClassroom(classroomId, data)
  }

  async function deleteClassroom(classroomId: string) {
    return await classroomService.deleteClassroom(classroomId)
  }

  return {
    classrooms: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchClassrooms,
    createClassroom,
    updateClassroom,
    deleteClassroom,
  }
}
