<script setup lang="ts">
import type { Classroom, Student } from '~/types/api'
import ClassroomDeleteModal from '~/components/modals/ClassroomDeleteModal.vue'
import ClassroomEditModal from '~/components/modals/ClassroomEditModal.vue'
import ClassroomRemoveStudentModal from '~/components/modals/ClassroomRemoveStudentModal.vue'

definePageMeta({
  path: '/classes/:classroomId',
})

const { t } = useI18n()
const route = useRoute()
const { $api } = useNuxtApp()

const { students: classroomStudents, fetchStudents: fetchClassroomStudents } = useAllStudents()
const { students: allStudents, fetchStudents: fetchAllStudents } = useAllStudents()
const {
  globalError: addStudentError,
  handleApiError: handleAddStudentError,
  clearErrors: clearAddStudentErrors,
} = useApiErrors()

const classroomId = computed(() => {
  const routeClassroomId = route.params.classroomId
  return Array.isArray(routeClassroomId) ? routeClassroomId[0] : routeClassroomId
})

if (!classroomId.value) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing classroom id',
  })
}

const classroom = ref<Classroom | null>(null)
const loading = ref(false)
const submittingAddStudent = ref(false)
const addStudentId = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showRemoveModal = ref(false)
const studentToRemove = ref<Student | null>(null)

const classroomName = computed(() => classroom.value?.name ?? '')

const classStudentIds = computed(() => new Set(classroomStudents.value.map(student => student.id)))
const assignableStudents = computed(() =>
  allStudents.value.filter(student => !classStudentIds.value.has(student.id)),
)
const assignableStudentOptions = computed(() =>
  assignableStudents.value.map(student => ({
    id: student.id,
    name: studentFullName(student),
  })),
)

function studentFullName(student: Student): string {
  return `${student.first_name} ${student.last_name}`
}

const selectedStudentToAdd = computed(() => {
  if (!addStudentId.value) return null
  return assignableStudents.value.find(student => student.id === addStudentId.value) ?? null
})

const canAddStudent = computed(() => !!selectedStudentToAdd.value && !submittingAddStudent.value)

async function fetchClassroomProfile() {
  loading.value = true
  try {
    const [classroomRes] = await Promise.all([
      $api<Classroom>(`/classrooms/${classroomId.value}`),
      fetchClassroomStudents(classroomId.value),
      fetchAllStudents(),
    ])
    classroom.value = classroomRes
  }
  finally {
    loading.value = false
  }
}

async function addStudentToClassroom() {
  const student = selectedStudentToAdd.value
  if (!classroomId.value || !student) return

  submittingAddStudent.value = true
  clearAddStudentErrors()

  try {
    await $api(`/classrooms/${classroomId.value}/students`, {
      method: 'POST',
      body: {
        student_id: student.id,
      },
    })
    addStudentId.value = ''
    await fetchClassroomProfile()
  }
  catch (err) {
    handleAddStudentError(err)
  }
  finally {
    submittingAddStudent.value = false
  }
}

function openRemoveModal(student: Student) {
  studentToRemove.value = student
  showRemoveModal.value = true
}

async function removeStudentFromClass(studentId: string) {
  await $api(`/classrooms/${classroomId.value}/students/${studentId}`, {
    method: 'DELETE',
  })
}

async function deleteClassroom(id: string) {
  await $api(`/classrooms/${id}`, {
    method: 'DELETE',
  })
}

function onActionConfirmed() {
  fetchClassroomProfile()
}

async function onDeleteConfirmed() {
  await navigateTo('/classes')
}

await fetchClassroomProfile()

watch(classroomId, (nextClassroomId, previousClassroomId) => {
  if (!nextClassroomId || nextClassroomId === previousClassroomId) return
  fetchClassroomProfile()
})
</script>

<template>
  <div>
    <ClassroomProfileBreadcrumb :classroom-name="classroom?.name ?? null" />

    <template v-if="classroom">
      <ClassroomProfileHeader
        :classroom="classroom"
        @edit="showEditModal = true"
        @delete="showDeleteModal = true"
      />

      <ClassroomProfileKpiCards :classroom="classroom" />

      <ClassroomProfileStudentsSection
        v-model="addStudentId"
        :students="classroomStudents"
        :student-count="classroom.student_count"
        :assignable-student-options="assignableStudentOptions"
        :can-add-student="canAddStudent"
        :add-student-error="addStudentError"
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
