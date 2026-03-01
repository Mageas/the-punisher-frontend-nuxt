<script setup lang="ts">
import type { Student } from '~/types/api'
import { computed } from 'vue'

const props = defineProps<{
  students?: readonly Student[]
  classroomId?: string | null
  excludeIds?: readonly string[]
  optionsScopeKey?: string | number | boolean | null
  placeholder?: string
  emptyText?: string
  selectedName?: string
  keepFocusOnSelect?: boolean
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()
const studentService = useStudentService()
const classroomService = useClassroomService()

const options = computed(() =>
  (props.students ?? [])
    .filter((student) => !(props.excludeIds ?? []).includes(student.id))
    .map((student) => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
    })),
)

const shouldUseRemoteOptions = computed(() => props.students === undefined)
const excludeScopeKey = computed(() => (props.excludeIds ?? []).join(','))
const resolvedOptionsScopeKey = computed(
  () =>
    props.optionsScopeKey ?? `${props.classroomId ?? '__all_students__'}|${excludeScopeKey.value}`,
)

async function fetchStudentOptions(options: { page: number; search?: string }) {
  const classroomId = props.classroomId || undefined
  const response = classroomId
    ? await classroomService.getClassroomStudents(classroomId, options)
    : await studentService.getStudents(options)

  return {
    ...response,
    data: response.data
      .filter((student) => !(props.excludeIds ?? []).includes(student.id))
      .map((student) => ({
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
      })),
  }
}
</script>

<template>
  <IdNameSearchInput
    v-model="modelValue"
    :options="options"
    :fetch-options="shouldUseRemoteOptions ? fetchStudentOptions : undefined"
    :options-scope-key="resolvedOptionsScopeKey"
    :selected-label="props.selectedName"
    :placeholder="props.placeholder ?? t('modals.penalty.selectStudent')"
    :empty-text="props.emptyText ?? t('modals.penalty.noStudentFound')"
    :keep-focus-on-select="props.keepFocusOnSelect"
  />
</template>
