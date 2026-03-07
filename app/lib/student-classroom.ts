interface ClassroomRef {
  id: string
  name: string
}

export function resolveStudentClassroomSelection(
  classrooms: readonly ClassroomRef[],
  options?: {
    currentClassroomId?: string | null
    preferredClassroomId?: string | null
  },
): {
  classroomId: string
  requiresExplicitSelection: boolean
} {
  const [firstClassroom] = classrooms

  if (classrooms.length === 1 && firstClassroom) {
    return {
      classroomId: firstClassroom.id,
      requiresExplicitSelection: false,
    }
  }

  if (classrooms.length > 1) {
    const candidateIds = [options?.currentClassroomId, options?.preferredClassroomId]
    const matchingClassroomId =
      candidateIds.find((candidateId) =>
        classrooms.some((classroom) => classroom.id === candidateId),
      ) ?? ''

    return {
      classroomId: matchingClassroomId,
      requiresExplicitSelection: true,
    }
  }

  return {
    classroomId: '',
    requiresExplicitSelection: false,
  }
}
