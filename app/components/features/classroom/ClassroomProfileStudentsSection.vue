<script setup lang="ts">
import { AlertCircle, Plus, Star, X } from 'lucide-vue-next'
import type { Student } from '~/types/api'
import { getInitials, formatPoints } from '~/lib/utils'

const props = withDefaults(
  defineProps<{
    students: readonly Student[]
    studentCount: number
    canAddStudent: boolean
    addStudentError?: string | null
    keepFocusOnStudentSelect?: boolean
  }>(),
  {
    addStudentError: null,
    keepFocusOnStudentSelect: false,
  },
)

const emit = defineEmits<{
  submitAdd: []
  removeStudent: [student: Student]
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()

function studentFullName(student: Student): string {
  return `${student.first_name} ${student.last_name}`
}

function initials(student: Student): string {
  return getInitials(student.first_name, student.last_name)
}

function formatBonusPoints(points: number): string {
  return formatPoints(points)
}

function onSubmit() {
  emit('submitAdd')
}

function onRemoveStudent(student: Student) {
  emit('removeStudent', student)
}

const existingStudentIds = computed(() => props.students.map((student) => student.id))
</script>

<template>
  <div class="mb-6">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold">
        {{ t('classProfile.students.title') }}
      </h2>
      <p class="text-sm text-muted-foreground">
        {{ t('classes.studentCount', studentCount) }}
      </p>
    </div>

    <Alert v-if="addStudentError" variant="destructive" class="mb-4">
      <AlertDescription>{{ addStudentError }}</AlertDescription>
    </Alert>

    <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="onSubmit">
      <div class="flex-1">
        <StudentSelect
          v-model="modelValue"
          :exclude-ids="existingStudentIds"
          :placeholder="t('classProfile.students.searchPlaceholder')"
          :empty-text="t('students.noStudents')"
          :keep-focus-on-select="props.keepFocusOnStudentSelect"
        />
      </div>

      <Button type="submit" class="cursor-pointer" :disabled="!canAddStudent">
        <Plus class="w-4 h-4" />
        {{ t('classProfile.actions.addStudent') }}
      </Button>
    </form>
  </div>

  <div v-if="students.length === 0" class="py-10 text-center text-muted-foreground">
    {{ t('classProfile.students.empty') }}
  </div>

  <div v-else class="space-y-1">
    <NuxtLink
      v-for="student in students"
      :key="student.id"
      :to="`/students/${student.id}`"
      class="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-secondary-hover"
    >
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium"
      >
        {{ initials(student) }}
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium">
          {{ studentFullName(student) }}
        </p>
      </div>

      <div class="flex items-center gap-1.5 text-xs">
        <span
          class="inline-flex items-center gap-1 rounded-full bg-warning-bg-subtle px-2 py-0.5 font-bold text-warning"
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
  </div>
</template>
