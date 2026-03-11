<script setup lang="ts">
import type { Student } from '~/types/api'
import { toStudentOption } from '~/composables/useTrackedEntityFilterOptions'
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  students?: readonly Student[]
  classroomId?: string | null
  excludeIds?: readonly string[]
  optionsScopeKey?: string | number | boolean | null
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  selectedName?: string
  keepFocusOnSelect?: boolean
  fullWidth?: boolean
  wrapperClass?: string
}>()

const modelValue = defineModel<string>({ default: '' })
const attrs = useAttrs()

const { t } = useI18n()
const { fetchStudentOptions: fetchTrackedStudentOptions } = useTrackedEntityFilterOptions({
  classroomId: computed(() => props.classroomId),
})

const options = computed(() =>
  (props.students ?? [])
    .filter((student) => !(props.excludeIds ?? []).includes(student.id))
    .map(toStudentOption),
)

const shouldUseRemoteOptions = computed(() => props.students === undefined)
const excludeScopeKey = computed(() => (props.excludeIds ?? []).join(','))
const resolvedOptionsScopeKey = computed(
  () =>
    props.optionsScopeKey ?? `${props.classroomId ?? '__all_students__'}|${excludeScopeKey.value}`,
)

async function fetchStudentOptions(options: { page: number; search?: string }) {
  let response = await fetchTrackedStudentOptions(options)
  let filteredOptions = response.data.filter(
    (student) => !(props.excludeIds ?? []).includes(student.id),
  )

  while (filteredOptions.length === 0 && response.next_page !== null) {
    response = await fetchTrackedStudentOptions({
      ...options,
      page: response.next_page,
    })
    filteredOptions = response.data.filter(
      (student) => !(props.excludeIds ?? []).includes(student.id),
    )
  }

  return {
    ...response,
    data: filteredOptions,
  }
}
</script>

<template>
  <EntityRemoteSelect
    v-bind="attrs"
    :key="String(resolvedOptionsScopeKey)"
    v-model="modelValue"
    :options="options"
    :fetch-options="shouldUseRemoteOptions ? fetchStudentOptions : undefined"
    :options-scope-key="resolvedOptionsScopeKey"
    :selected-name="props.selectedName"
    :placeholder="props.placeholder ?? t('common.placeholders.selectStudent')"
    :search-placeholder="props.searchPlaceholder ?? props.placeholder"
    :empty-text="props.emptyText ?? t('common.empty.noStudents')"
    :keep-focus-on-select="props.keepFocusOnSelect"
    :full-width="props.fullWidth ?? true"
    :wrapper-class="props.wrapperClass"
  />
</template>
