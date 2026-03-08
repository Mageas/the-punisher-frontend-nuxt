import type { MaybeRefOrGetter, Ref } from 'vue'
import type { Student } from '~/types/api'
import { resolveStudentClassroomSelection } from '~/lib/student-classroom'

interface StudentClassroomSelectionValues {
  student_lookup_classroom_id?: string
  student_id?: string
}

interface UseResolvedStudentClassroomSelectionOptions<
  TValues extends StudentClassroomSelectionValues,
> {
  open: Readonly<Ref<boolean>>
  values: TValues
  setFieldValue: (
    field: 'classroom_id' | 'student_id',
    value: string,
    shouldValidate?: boolean,
  ) => void
  setFieldError: (field: 'classroom_id', message: string | undefined) => void
  preselectedStudentId?: MaybeRefOrGetter<string | null | undefined>
  preselectedClassroomId?: MaybeRefOrGetter<string | null | undefined>
}

export function useResolvedStudentClassroomSelection<
  TValues extends StudentClassroomSelectionValues,
>(options: UseResolvedStudentClassroomSelectionOptions<TValues>) {
  const studentService = useStudentService()

  const hasPreselectedStudent = computed(() => Boolean(toValue(options.preselectedStudentId)))
  const hasPreselectedClassroom = computed(() => Boolean(toValue(options.preselectedClassroomId)))
  const selectedStudentClassrooms = ref<Student['classrooms']>([])
  const loadingSelectedStudentClassrooms = ref(false)
  const selectedStudentClassroomId = ref('')
  const isStudentClassroomDrawerOpen = ref(false)
  const isBootstrapping = ref(false)

  let classroomLookupRequestId = 0

  const studentClassroomOptions = computed(() =>
    selectedStudentClassrooms.value.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
    })),
  )
  const requiresStudentClassroomSelection = computed(
    () => selectedStudentClassrooms.value.length > 1,
  )
  const shouldShowStudentClassroomSelect = computed(() => requiresStudentClassroomSelection.value)
  const isStudentClassroomMissing = computed(
    () => requiresStudentClassroomSelection.value && !selectedStudentClassroomId.value,
  )

  function clearStudentClassroomError() {
    options.setFieldError('classroom_id', undefined)
  }

  function getPreferredLookupClassroomId() {
    return options.values.student_lookup_classroom_id || ''
  }

  function getFallbackSelectedClassroomId(nextLookupClassroomId = getPreferredLookupClassroomId()) {
    if (hasPreselectedStudent.value) return ''

    return nextLookupClassroomId || toValue(options.preselectedClassroomId) || ''
  }

  function syncStudentClassroomDrawerState(classroomId: string) {
    isStudentClassroomDrawerOpen.value = selectedStudentClassrooms.value.length > 1 && !classroomId
  }

  function applySelectedStudentClassroom(classroomId: string) {
    selectedStudentClassroomId.value = classroomId
    options.setFieldValue('classroom_id', classroomId, false)
  }

  function cancelStudentClassroomLookup() {
    classroomLookupRequestId += 1
    loadingSelectedStudentClassrooms.value = false
  }

  function resetResolvedStudentClassroomState(nextClassroomId = getFallbackSelectedClassroomId()) {
    cancelStudentClassroomLookup()
    selectedStudentClassrooms.value = []
    clearStudentClassroomError()
    isStudentClassroomDrawerOpen.value = false
    applySelectedStudentClassroom(nextClassroomId)
  }

  function selectStudentClassroom(classroomId: string) {
    applySelectedStudentClassroom(classroomId)
    isStudentClassroomDrawerOpen.value = false
  }

  async function loadSelectedStudentClassrooms(studentId: string) {
    const requestId = ++classroomLookupRequestId
    loadingSelectedStudentClassrooms.value = true

    try {
      const student = await studentService.getStudentById(studentId)

      if (requestId !== classroomLookupRequestId) return

      selectedStudentClassrooms.value = student.classrooms
      clearStudentClassroomError()

      const { classroomId } = resolveStudentClassroomSelection(student.classrooms, {
        currentClassroomId: selectedStudentClassroomId.value,
        preferredClassroomId: getPreferredLookupClassroomId() || null,
      })

      applySelectedStudentClassroom(classroomId)
      syncStudentClassroomDrawerState(classroomId)
    } catch {
      if (requestId !== classroomLookupRequestId) return

      resetResolvedStudentClassroomState()
    } finally {
      if (requestId === classroomLookupRequestId) {
        loadingSelectedStudentClassrooms.value = false
      }
    }
  }

  async function initializeResolvedStudentClassroomSelection() {
    isBootstrapping.value = true

    try {
      resetResolvedStudentClassroomState(getFallbackSelectedClassroomId())

      const preselectedStudentId = toValue(options.preselectedStudentId)
      if (preselectedStudentId) {
        await loadSelectedStudentClassrooms(preselectedStudentId)
      }
    } finally {
      isBootstrapping.value = false
    }
  }

  function cleanupResolvedStudentClassroomSelection() {
    isBootstrapping.value = true

    try {
      resetResolvedStudentClassroomState('')
    } finally {
      isBootstrapping.value = false
    }
  }

  watch(
    () => options.values.student_lookup_classroom_id,
    (nextClassroomId) => {
      if (!options.open.value || isBootstrapping.value) return
      if (hasPreselectedStudent.value) return

      resetResolvedStudentClassroomState(nextClassroomId || '')
      options.setFieldValue('student_id', '', false)
    },
  )

  watch(
    () => options.values.student_id,
    async (studentId) => {
      if (!options.open.value || isBootstrapping.value) return

      if (!studentId) {
        resetResolvedStudentClassroomState()
        return
      }

      await loadSelectedStudentClassrooms(studentId)
    },
  )

  watch(selectedStudentClassroomId, (classroomId) => {
    if (!classroomId) return

    clearStudentClassroomError()
    if (selectedStudentClassrooms.value.length > 1) {
      isStudentClassroomDrawerOpen.value = false
    }
  })

  return {
    hasPreselectedStudent,
    hasPreselectedClassroom,
    selectedStudentClassrooms,
    loadingSelectedStudentClassrooms,
    selectedStudentClassroomId,
    studentClassroomOptions,
    requiresStudentClassroomSelection,
    shouldShowStudentClassroomSelect,
    isStudentClassroomMissing,
    isStudentClassroomDrawerOpen,
    selectStudentClassroom,
    loadSelectedStudentClassrooms,
    initializeResolvedStudentClassroomSelection,
    cleanupResolvedStudentClassroomSelection,
  }
}
