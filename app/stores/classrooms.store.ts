import { createStaticPaginatedStore } from './_shared/createStaticPaginatedStore'
import { classroomService } from '~/services/classroom.service'
import type { Classroom } from '~/types/api'

export const useClassroomsStore = createStaticPaginatedStore<
  Classroom,
  { search?: string }
>({
  id: 'classrooms',
  resource: 'classrooms',
  service: {
    list: (params) => classroomService.getClassrooms(params),
    create: (payload) => classroomService.createClassroom(payload),
    update: (id, payload) => classroomService.updateClassroom(id, payload),
    delete: (id) => classroomService.deleteClassroom(id),
  },
  allowedStableFilterKeys: [], // No stable filters for now
  staleTimeMs: 30_000,
  maxCachedPages: 20,
})
