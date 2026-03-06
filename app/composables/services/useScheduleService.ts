import type {
  NextLesson,
  ScheduleException,
  ScheduleExceptionCreateData,
  ScheduleExceptionUpdateData,
  ScheduleSlot,
  ScheduleSlotCreateData,
  ScheduleSlotUpdateData,
} from '~/types/api'

export function useScheduleService() {
  const { $api } = useNuxtApp()

  async function getScheduleSlots() {
    return $api<ScheduleSlot[]>('/schedule/slots')
  }

  async function getScheduleSlotById(scheduleSlotId: string) {
    return $api<ScheduleSlot>(`/schedule/slots/${scheduleSlotId}`)
  }

  async function createScheduleSlot(data: ScheduleSlotCreateData) {
    return $api<ScheduleSlot>('/schedule/slots', {
      method: 'POST',
      body: data,
    })
  }

  async function updateScheduleSlot(scheduleSlotId: string, data: ScheduleSlotUpdateData) {
    return $api<ScheduleSlot>(`/schedule/slots/${scheduleSlotId}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteScheduleSlot(scheduleSlotId: string): Promise<void> {
    await $api(`/schedule/slots/${scheduleSlotId}`, {
      method: 'DELETE',
    })
  }

  async function getScheduleExceptions() {
    return $api<ScheduleException[]>('/schedule/exceptions')
  }

  async function getScheduleExceptionById(scheduleExceptionId: string) {
    return $api<ScheduleException>(`/schedule/exceptions/${scheduleExceptionId}`)
  }

  async function createScheduleException(data: ScheduleExceptionCreateData) {
    return $api<ScheduleException>('/schedule/exceptions', {
      method: 'POST',
      body: data,
    })
  }

  async function updateScheduleException(
    scheduleExceptionId: string,
    data: ScheduleExceptionUpdateData,
  ) {
    return $api<ScheduleException>(`/schedule/exceptions/${scheduleExceptionId}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteScheduleException(scheduleExceptionId: string): Promise<void> {
    await $api(`/schedule/exceptions/${scheduleExceptionId}`, {
      method: 'DELETE',
    })
  }

  async function getClassroomNextLessons(classroomId: string) {
    return $api<NextLesson[]>(`/classrooms/${classroomId}/next-lessons`)
  }

  return {
    getScheduleSlots,
    getScheduleSlotById,
    createScheduleSlot,
    updateScheduleSlot,
    deleteScheduleSlot,
    getScheduleExceptions,
    getScheduleExceptionById,
    createScheduleException,
    updateScheduleException,
    deleteScheduleException,
    getClassroomNextLessons,
  }
}
