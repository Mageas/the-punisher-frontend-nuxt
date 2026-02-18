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
const { bonusTypes, fetchAllBonusTypes } = useBonusTypes()

// Form
const selectedClassroomId = ref('')
const selectedStudentId = ref('')
const selectedBonusTypeId = ref('')
const points = ref<number>(1)
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
    selectedBonusTypeId.value = ''
    points.value = 1
    await Promise.all([fetchAllClassrooms(), fetchAllStudents(), fetchAllBonusTypes()])
  }
})

async function submit() {
  if (!selectedStudentId.value || !selectedBonusTypeId.value) return
  submitting.value = true
  clearErrors()

  try {
    await $api('/bonuses/', {
      method: 'POST',
      body: {
        student_id: selectedStudentId.value,
        bonus_type_id: selectedBonusTypeId.value,
        points: points.value,
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
        <DialogTitle>{{ t('modals.bonus.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.bonus.title') }}</DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="submit">
        <!-- Global error -->
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <!-- Classroom -->
        <div class="space-y-2">
          <Label>{{ t('modals.bonus.class') }}</Label>
          <ClassroomSelect v-model="selectedClassroomId" :classrooms="classrooms" full-width />
        </div>

        <!-- Student -->
        <div class="space-y-2">
          <Label>{{ t('modals.bonus.student') }}</Label>
          <StudentSelect
            v-model="selectedStudentId"
            :students="students"
            :placeholder="t('modals.bonus.selectStudent')"
            :search-placeholder="t('modals.bonus.searchStudent')"
            :empty-text="t('modals.bonus.noStudentFound')"
          />
          <p v-if="fieldErrors.student_id" class="text-sm text-destructive">{{ fieldErrors.student_id }}</p>
        </div>

        <!-- Bonus Type -->
        <div class="space-y-2">
          <Label>{{ t('modals.bonus.bonusType') }}</Label>
          <BonusTypeSelect v-model="selectedBonusTypeId" :bonus-types="bonusTypes" />
          <p v-if="fieldErrors.bonus_type_id" class="text-sm text-destructive">{{ fieldErrors.bonus_type_id }}</p>
        </div>

        <!-- Points -->
        <div class="space-y-2">
          <Label>{{ t('modals.bonus.points') }}</Label>
          <Input v-model.number="points" type="number" step="0.1" min="0" :placeholder="t('modals.bonus.pointsPlaceholder')" />
          <p v-if="fieldErrors.points" class="text-sm text-destructive">{{ fieldErrors.points }}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
            {{ t('modals.bonus.cancel') }}
          </Button>
          <Button type="submit" class="cursor-pointer" :disabled="submitting || !selectedStudentId || !selectedBonusTypeId">
            {{ t('modals.bonus.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
