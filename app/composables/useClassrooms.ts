import type { Classroom } from '~/types/api'
import { classroomService } from '~/services/classroom.service'

/**
 * Composable to fetch and manage classrooms with pagination.
 */
export function useClassrooms() {
  const { $api } = useNuxtApp()

  const paginated = usePaginatedCollection<
    Classroom,
    {
      page?: number
    }
  >((options) => classroomService.getClassrooms($api, options))

  async function fetchClassrooms(options?: {
    page?: number
  }) {
    await paginated.fetchPage(options)
  }

  async function createClassroom(data: { name: string; school_year: string }) {
    return await classroomService.createClassroom($api, data)
  }

  async function updateClassroom(classroomId: string, data: { name?: string; school_year?: string }) {
    return await classroomService.updateClassroom($api, classroomId, data)
  }

  async function deleteClassroom(classroomId: string) {
    return await classroomService.deleteClassroom($api, classroomId)
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
