<script setup lang="ts">
const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })
const props = withDefaults(defineProps<{
  preselectedStudentId?: string | null
  preselectedClassroomId?: string | null
}>(), {
  preselectedStudentId: null,
  preselectedClassroomId: null,
})

const { t } = useI18n()
const { $api } = useNuxtApp()
const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()
const { classrooms, fetchClassrooms } = useAllClassrooms()
const { students, fetchStudents } = useAllStudents()
const { penaltyTypes, fetchPenaltyTypes } = useAllPenaltyTypes()

// Form
const selectedClassroomId = ref('')
const selectedStudentId = ref('')
const selectedPenaltyTypeId = ref('')
const submitting = ref(false)
const hasPreselectedStudent = computed(() => !!props.preselectedStudentId)
const hasPreselectedClassroom = computed(() => !!props.preselectedClassroomId)

// When classroom changes, re-fetch students and reset student selection
watch(selectedClassroomId, () => {
  if (hasPreselectedStudent.value) return
  selectedStudentId.value = ''
  fetchStudents(selectedClassroomId.value || undefined)
})

// Load data when modal opens
watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    selectedClassroomId.value = props.preselectedClassroomId ?? ''
    selectedStudentId.value = props.preselectedStudentId ?? ''
    selectedPenaltyTypeId.value = ''
    await Promise.all([
      hasPreselectedStudent.value || hasPreselectedClassroom.value ? Promise.resolve() : fetchClassrooms(),
      fetchStudents(selectedClassroomId.value || undefined),
      fetchPenaltyTypes(),
    ])
    if (props.preselectedStudentId) {
      selectedStudentId.value = props.preselectedStudentId
    }
  }
})

async function submit() {
  if (!selectedStudentId.value || !selectedPenaltyTypeId.value) return
  submitting.value = true
  clearErrors()
  try {
    await $api('/penalties/', {
      method: 'POST',
      body: {
        student_id: selectedStudentId.value,
        penalty_type_id: selectedPenaltyTypeId.value,
      },
    })
    open.value = false
    emit('created')
  }
  catch (err) {
    handleApiError(err)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="min-w-0 sm:max-w-md" @open-auto-focus.prevent>
      <DialogHeader>
        <DialogTitle>{{ t('modals.penalty.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.penalty.title') }}</DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="submit">
        <!-- Global error -->
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <template v-if="!hasPreselectedStudent">
          <!-- Classroom -->
          <div v-if="!hasPreselectedClassroom" class="space-y-2">
            <Label>{{ t('modals.penalty.class') }}</Label>
            <ClassroomSelect v-model="selectedClassroomId" :classrooms="classrooms" full-width />
          </div>

          <!-- Student -->
          <div class="space-y-2">
            <Label>{{ t('modals.penalty.student') }}</Label>
            <StudentSelect
              v-model="selectedStudentId"
              :students="students"
              :placeholder="t('modals.penalty.selectStudent')"
              :empty-text="t('modals.penalty.noStudentFound')"
            />
            <p v-if="fieldErrors.student_id" class="text-sm text-destructive">{{ fieldErrors.student_id }}</p>
          </div>
        </template>

        <!-- Penalty Type -->
        <div class="space-y-2">
          <Label>{{ t('modals.penalty.penaltyType') }}</Label>
          <PenaltyTypeSelect v-model="selectedPenaltyTypeId" :penalty-types="penaltyTypes" />
          <p v-if="fieldErrors.penalty_type_id" class="text-sm text-destructive">{{ fieldErrors.penalty_type_id }}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
            {{ t('modals.penalty.cancel') }}
          </Button>
          <Button type="submit" class="cursor-pointer" :disabled="submitting || !selectedStudentId || !selectedPenaltyTypeId">
            {{ t('modals.penalty.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
