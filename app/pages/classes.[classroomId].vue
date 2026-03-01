<script setup lang="ts">
import type { Classroom, Student } from '~/types/api'

const { t } = useI18n()
const classroomService = useClassroomService()

definePageMeta({
  path: '/classes/:classroomId',
})

const route = useRoute()

const {
  globalError: addStudentError,
  handleApiError: handleAddStudentError,
  clearErrors: clearAddStudentErrors,
} = useApiErrors()

const classroomId = computed<string>(() => {
  const routeClassroomId = route.params.classroomId
  return (Array.isArray(routeClassroomId) ? routeClassroomId[0] : routeClassroomId) as string
})
const { kpis: classroomKpis, fetchKpis: fetchClassroomKpis } = useClassroomKpis(classroomId)

const classroom = ref<Classroom | null>(null)
const classroomStudents = ref<Student[]>([])
const loading = ref(false)
const submittingAddStudent = ref(false)
const addStudentId = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showRemoveModal = ref(false)
const studentToRemove = ref<Student | null>(null)

const classroomName = computed(() => classroom.value?.name ?? '')

function studentFullName(student: Student): string {
  return `${student.first_name} ${student.last_name}`
}

const canAddStudent = computed(() => !!addStudentId.value && !submittingAddStudent.value)

async function fetchAllClassroomStudents() {
  const all: Student[] = []
  let pageToLoad = 1
  let hasMore = true

  while (hasMore) {
    const response = await classroomService.getClassroomStudents(classroomId.value, {
      page: pageToLoad,
    })
    all.push(...response.data)

    if (response.next_page === null) {
      hasMore = false
      continue
    }

    pageToLoad = response.next_page
  }

  classroomStudents.value = all
}

async function fetchClassroomProfile() {
  loading.value = true
  try {
    const [classroomRes] = await Promise.all([
      classroomService.getClassroomById(classroomId.value),
      fetchClassroomKpis(),
      fetchAllClassroomStudents(),
    ])
    classroom.value = classroomRes
  } finally {
    loading.value = false
  }
}

async function addStudentToClassroom() {
  if (!classroomId.value || !addStudentId.value) return

  submittingAddStudent.value = true
  clearAddStudentErrors()

  try {
    await classroomService.addStudentToClassroom(classroomId.value, addStudentId.value)
    addStudentId.value = ''
    await fetchClassroomProfile()
  } catch (err) {
    handleAddStudentError(err)
  } finally {
    submittingAddStudent.value = false
  }
}

function openRemoveModal(student: Student) {
  studentToRemove.value = student
  showRemoveModal.value = true
}

async function removeStudentFromClass(studentId: string) {
  await classroomService.removeStudentFromClassroom(classroomId.value, studentId)
}

async function deleteClassroom(id: string) {
  await classroomService.deleteClassroom(id)
}

async function onActionConfirmed() {
  await fetchClassroomProfile()
}

async function onDeleteConfirmed() {
  await navigateTo('/classes')
}

await fetchClassroomProfile()

watch(classroomId, async (nextClassroomId, previousClassroomId) => {
  if (!nextClassroomId || nextClassroomId === previousClassroomId) return
  await fetchClassroomProfile()
})
</script>

<template>
  <div>
    <AppBreadcrumb
      :items="[
        { label: t('classes.title'), to: '/classes' },
        { label: classroom?.name ?? t('common.loading') },
      ]"
    />

    <template v-if="classroom && classroomKpis">
      <ClassroomProfileHeader
        :classroom="classroom"
        @edit="showEditModal = true"
        @delete="showDeleteModal = true"
      />

      <ClassroomProfileKpiCards :kpis="classroomKpis" />

      <ClassroomProfileStudentsSection
        v-model="addStudentId"
        :students="classroomStudents"
        :student-count="classroom.student_count"
        :can-add-student="canAddStudent"
        :add-student-error="addStudentError"
        keep-focus-on-student-select
        @submit-add="addStudentToClassroom"
        @remove-student="openRemoveModal"
      />
    </template>

    <div v-else-if="loading" class="py-16 text-center text-muted-foreground">
      {{ t('classProfile.loading') }}
    </div>

    <ClassroomEditModal
      v-model:open="showEditModal"
      :classroom-id="classroom?.id ?? null"
      :name="classroom?.name ?? ''"
      :year="classroom?.year ?? ''"
      @updated="onActionConfirmed"
    />
    <ClassroomDeleteModal
      v-model:open="showDeleteModal"
      :classroom-id="classroom?.id ?? null"
      :classroom-name="classroom?.name ?? ''"
      :delete-fn="deleteClassroom"
      @confirmed="onDeleteConfirmed"
    />
    <ClassroomRemoveStudentModal
      v-model:open="showRemoveModal"
      :student-id="studentToRemove?.id ?? null"
      :student-name="studentToRemove ? studentFullName(studentToRemove) : ''"
      :classroom-name="classroomName"
      :remove-fn="removeStudentFromClass"
      @confirmed="onActionConfirmed"
    />
  </div>
</template>
