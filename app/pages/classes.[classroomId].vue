<script setup lang="ts">
import type { Classroom, Student } from '~/types/api'

const { t } = useI18n()
const classroomService = useClassroomService()
const { notifyAddSuccess } = useActionToast()

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
const { isPending: submittingAddStudent, withPending: withAddStudentSubmitting } =
  useApiActionState()
const addStudentId = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showRemoveModal = ref(false)
const showBulkBonusModal = ref(false)
const showBulkPenaltyModal = ref(false)
const showBulkPunishmentModal = ref(false)
const studentToRemove = ref<Student | null>(null)
const bulkActionStudents = ref<Student[]>([])

const studentsSection = ref<{ exitSelectionMode: () => void } | null>(null)

const classroomName = computed(() => classroom.value?.name ?? '')

function studentFullName(student: Student): string {
  return `${student.first_name} ${student.last_name}`
}

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

  clearAddStudentErrors()

  try {
    await withAddStudentSubmitting(async () => {
      await classroomService.addStudentToClassroom(classroomId.value, addStudentId.value)
      addStudentId.value = ''
      await fetchClassroomProfile()
      notifyAddSuccess()
    })
  } catch (err) {
    handleAddStudentError(err)
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

function resolveBulkStudents(studentIds: string[]) {
  bulkActionStudents.value = classroomStudents.value.filter((student) =>
    studentIds.includes(student.id),
  )
}

function onBulkBonus(studentIds: string[]) {
  resolveBulkStudents(studentIds)
  showBulkBonusModal.value = true
}

function onBulkPenalty(studentIds: string[]) {
  resolveBulkStudents(studentIds)
  showBulkPenaltyModal.value = true
}

function onBulkPunishment(studentIds: string[]) {
  resolveBulkStudents(studentIds)
  showBulkPunishmentModal.value = true
}

async function onBulkActionCreated() {
  await fetchClassroomProfile()
  studentsSection.value?.exitSelectionMode()
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
        { label: t('common.titles.classes'), to: '/classes' },
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
        ref="studentsSection"
        v-model="addStudentId"
        :students="classroomStudents"
        :student-count="classroom.student_count"
        :submitting-add-student="submittingAddStudent"
        :add-student-error="addStudentError"
        keep-focus-on-student-select
        @submit-add="addStudentToClassroom"
        @remove-student="openRemoveModal"
        @bulk-bonus="onBulkBonus"
        @bulk-penalty="onBulkPenalty"
        @bulk-punishment="onBulkPunishment"
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
    <ClassroomBulkBonusModal
      v-model:open="showBulkBonusModal"
      :students="bulkActionStudents"
      @created="onBulkActionCreated"
    />
    <ClassroomBulkPenaltyModal
      v-model:open="showBulkPenaltyModal"
      :students="bulkActionStudents"
      :classroom-id="classroomId"
      @created="onBulkActionCreated"
    />
    <ClassroomBulkPunishmentModal
      v-model:open="showBulkPunishmentModal"
      :students="bulkActionStudents"
      :classroom-id="classroomId"
      @created="onBulkActionCreated"
    />
  </div>
</template>
