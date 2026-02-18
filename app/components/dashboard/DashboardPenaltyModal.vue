<script setup lang="ts">
const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { $api } = useNuxtApp()
const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()
const { classrooms, fetchAllClassrooms } = useClassrooms()
const { students, fetchAllStudents } = useStudents()
const { penaltyTypes, fetchAllPenaltyTypes } = usePenaltyTypes()

// Form
const selectedClassroomId = ref('')
const selectedStudentId = ref('')
const selectedPenaltyTypeId = ref('')
const submitting = ref(false)

// When classroom changes, re-fetch students and reset student selection
watch(selectedClassroomId, () => {
  selectedStudentId.value = ''
  fetchAllStudents(selectedClassroomId.value || undefined)
})

// Load data when modal opens
watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    selectedClassroomId.value = ''
    selectedStudentId.value = ''
    selectedPenaltyTypeId.value = ''
    await Promise.all([fetchAllClassrooms(), fetchAllStudents(), fetchAllPenaltyTypes()])
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
    <DialogContent class="min-w-0 overflow-x-hidden sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('modals.penalty.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.penalty.title') }}</DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="submit">
        <!-- Global error -->
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <!-- Classroom -->
        <div class="space-y-2">
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
            :search-placeholder="t('modals.penalty.searchStudent')"
            :empty-text="t('modals.penalty.noStudentFound')"
          />
          <p v-if="fieldErrors.student_id" class="text-sm text-destructive">{{ fieldErrors.student_id }}</p>
        </div>

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
