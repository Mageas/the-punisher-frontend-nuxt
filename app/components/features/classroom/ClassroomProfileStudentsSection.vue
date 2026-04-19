<script setup lang="ts">
import { AlertCircle, AlertTriangle, CheckSquare, Gavel, Plus, Star, X } from 'lucide-vue-next'
import type { Student } from '~/types/api'
import { formatPoints } from '~/lib/utils'
import { Checkbox } from '~/components/ui/checkbox'

const props = withDefaults(
  defineProps<{
    students: readonly Student[]
    studentCount: number
    submittingAddStudent?: boolean
    addStudentError?: string | null
    keepFocusOnStudentSelect?: boolean
  }>(),
  {
    submittingAddStudent: false,
    addStudentError: null,
    keepFocusOnStudentSelect: false,
  },
)

const emit = defineEmits<{
  submitAdd: []
  removeStudent: [student: Student]
  bulkBonus: [studentIds: string[]]
  bulkPenalty: [studentIds: string[]]
  bulkPunishment: [studentIds: string[]]
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()
const hasAttemptedSubmit = ref(false)

// Selection mode
const selectionMode = ref(false)
const selectedStudentIds = ref<Set<string>>(new Set())

const sortedStudents = computed(() =>
  [...props.students].sort((a, b) => {
    const lastCmp = a.last_name.localeCompare(b.last_name, 'fr')
    return lastCmp !== 0 ? lastCmp : a.first_name.localeCompare(b.first_name, 'fr')
  }),
)

const selectedCount = computed(() => selectedStudentIds.value.size)
const allSelected = computed(
  () => props.students.length > 0 && selectedStudentIds.value.size === props.students.length,
)

function toggleSelectionMode() {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedStudentIds.value = new Set()
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedStudentIds.value = new Set()
  } else {
    selectedStudentIds.value = new Set(props.students.map((s) => s.id))
  }
}

function toggleStudent(studentId: string) {
  const next = new Set(selectedStudentIds.value)
  if (next.has(studentId)) {
    next.delete(studentId)
  } else {
    next.add(studentId)
  }
  selectedStudentIds.value = next
}

function onBulkPenalty() {
  emit('bulkPenalty', Array.from(selectedStudentIds.value))
}

function onBulkBonus() {
  emit('bulkBonus', Array.from(selectedStudentIds.value))
}

function onBulkPunishment() {
  emit('bulkPunishment', Array.from(selectedStudentIds.value))
}

useGlobalErrorToast(() => props.addStudentError)

function studentFullName(student: Student): string {
  return `${student.first_name} ${student.last_name}`
}

function formatBonusPoints(points: number): string {
  return formatPoints(points)
}

function onSubmit() {
  hasAttemptedSubmit.value = true

  if (!modelValue.value) {
    return
  }

  emit('submitAdd')
}

function onRemoveStudent(student: Student) {
  emit('removeStudent', student)
}

const existingStudentIds = computed(() => props.students.map((student) => student.id))
const localError = computed(() =>
  hasAttemptedSubmit.value && !modelValue.value
    ? t('apiErrors.details.validation_field_required')
    : '',
)

watch(modelValue, (nextValue, previousValue) => {
  if (nextValue || previousValue) {
    hasAttemptedSubmit.value = false
  }
})

function exitSelectionMode() {
  selectionMode.value = false
  selectedStudentIds.value = new Set()
}

defineExpose({ exitSelectionMode })

// Clean up selection when students list changes
watch(
  () => props.students,
  () => {
    if (!selectionMode.value) return
    const validIds = new Set(props.students.map((s) => s.id))
    const cleaned = new Set([...selectedStudentIds.value].filter((id) => validIds.has(id)))
    if (cleaned.size !== selectedStudentIds.value.size) {
      selectedStudentIds.value = cleaned
    }
  },
)
</script>

<template>
  <div class="mb-6">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold">
        {{ t('classProfile.students.title') }}
      </h2>
      <div class="flex items-center gap-2">
        <Button
          v-if="students.length > 0"
          variant="outline"
          size="sm"
          class="cursor-pointer gap-1.5"
          :class="selectionMode ? 'border-primary text-primary' : ''"
          @click="toggleSelectionMode"
        >
          <CheckSquare class="h-4 w-4" />
          {{ selectionMode ? t('classProfile.selection.exit') : t('classProfile.selection.enter') }}
        </Button>
        <p class="text-sm text-muted-foreground">
          {{ t('common.counts.student', studentCount) }}
        </p>
      </div>
    </div>

    <form class="flex w-full flex-col gap-2 sm:flex-row sm:items-start" @submit.prevent="onSubmit">
      <div class="min-w-0 flex-1">
        <StudentSelect
          v-model="modelValue"
          :exclude-ids="existingStudentIds"
          :placeholder="t('classProfile.students.searchPlaceholder')"
          :empty-text="t('common.empty.noStudents')"
          :keep-focus-on-select="props.keepFocusOnStudentSelect"
          :full-width="true"
          wrapper-class="w-full"
        />
        <p v-if="localError" class="mt-2 text-sm text-destructive">
          {{ localError }}
        </p>
      </div>

      <LoadingButton
        type="submit"
        class="cursor-pointer sm:self-start"
        :loading="props.submittingAddStudent"
      >
        <Plus class="w-4 h-4" />
        {{ t('common.actions.addStudent') }}
      </LoadingButton>
    </form>
  </div>

  <!-- Selection toolbar -->
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="selectionMode"
      class="mb-3 flex flex-col gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="text-sm text-primary hover:underline cursor-pointer"
          @click="toggleSelectAll"
        >
          {{
            allSelected
              ? t('classProfile.selection.deselectAll')
              : t('classProfile.selection.selectAll')
          }}
        </button>
        <span v-if="selectedCount > 0" class="text-sm text-muted-foreground">
          — {{ t('classProfile.selection.count', selectedCount) }}
        </span>
      </div>

      <div v-if="selectedCount > 0" class="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="cursor-pointer gap-1.5"
          @click="onBulkBonus"
        >
          <Star class="h-4 w-4" />
          {{ t('classProfile.selection.addBonus') }}
        </Button>

        <Button
          type="button"
          variant="default"
          size="sm"
          class="cursor-pointer gap-1.5"
          @click="onBulkPenalty"
        >
          <AlertTriangle class="h-4 w-4" />
          {{ t('classProfile.selection.addPenalty') }}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          class="cursor-pointer gap-1.5"
          @click="onBulkPunishment"
        >
          <Gavel class="h-4 w-4" />
          {{ t('classProfile.selection.addPunishment') }}
        </Button>
      </div>
    </div>
  </Transition>

  <div v-if="students.length === 0" class="py-10 text-center text-muted-foreground">
    {{ t('classProfile.students.empty') }}
  </div>

  <div v-else class="space-y-1">
    <template v-for="student in sortedStudents" :key="student.id">
      <div
        v-if="selectionMode"
        class="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors cursor-pointer"
        :class="
          selectedStudentIds.has(student.id)
            ? 'bg-primary/5 border-primary/30'
            : 'hover:bg-secondary-hover'
        "
        @click="toggleStudent(student.id)"
      >
        <Checkbox
          :checked="selectedStudentIds.has(student.id)"
          class="pointer-events-none"
          tabindex="-1"
        />

        <StudentAvatar :first-name="student.first_name" :last-name="student.last_name" size="md" />

        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium">
            {{ studentFullName(student) }}
          </p>
        </div>

        <div class="flex items-center gap-1.5 text-xs">
          <span
            class="inline-flex items-center gap-1 rounded-full bg-warning-bg-subtle px-2 py-0.5 font-bold text-warning-foreground"
          >
            <Star class="h-3 w-3" />
            {{ formatBonusPoints(student.available_bonus_points) }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 text-xs">
          <span
            class="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-muted-foreground"
          >
            <AlertCircle class="h-3 w-3" />
            {{ student.penalty_count }}
          </span>
        </div>
      </div>

      <NuxtLink
        v-else
        :to="`/students/${student.id}`"
        class="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-secondary-hover"
      >
        <StudentAvatar :first-name="student.first_name" :last-name="student.last_name" size="md" />

        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium">
            {{ studentFullName(student) }}
          </p>
        </div>

        <div class="flex items-center gap-1.5 text-xs">
          <span
            class="inline-flex items-center gap-1 rounded-full bg-warning-bg-subtle px-2 py-0.5 font-bold text-warning-foreground"
          >
            <Star class="h-3 w-3" />
            {{ formatBonusPoints(student.available_bonus_points) }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 text-xs">
          <span
            class="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-muted-foreground"
          >
            <AlertCircle class="h-3 w-3" />
            {{ student.penalty_count }}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          class="cursor-pointer text-muted-foreground hover:text-foreground"
          :title="t('classProfile.actions.removeStudent')"
          :aria-label="t('classProfile.actions.removeStudent')"
          @click.prevent.stop="onRemoveStudent(student)"
        >
          <X class="w-4 h-4 text-danger" />
        </Button>
      </NuxtLink>
    </template>
  </div>
</template>
