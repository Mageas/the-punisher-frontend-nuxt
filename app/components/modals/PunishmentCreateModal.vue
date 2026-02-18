<script setup lang="ts">
const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { $api } = useNuxtApp()
const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()
const { classrooms, fetchClassrooms } = useAllClassrooms()
const { students, fetchStudents } = useAllStudents()
const { punishmentTypes, fetchPunishmentTypes } = useAllPunishmentTypes()

// Form
const selectedClassroomId = ref('')
const selectedStudentId = ref('')
const selectedPunishmentTypeId = ref('')
const dueAt = ref<DateValue>()
const dueAtTime = ref('08:00')
const submitting = ref(false)

// When classroom changes, re-fetch students and reset student selection
watch(selectedClassroomId, () => {
  selectedStudentId.value = ''
  fetchStudents(selectedClassroomId.value || undefined)
})

// Load data when modal opens
watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    selectedClassroomId.value = ''
    selectedStudentId.value = ''
    selectedPunishmentTypeId.value = ''
    dueAt.value = undefined
    dueAtTime.value = '08:00'
    await Promise.all([fetchClassrooms(), fetchStudents(), fetchPunishmentTypes()])
  }
})

async function submit() {
  if (!selectedStudentId.value || !selectedPunishmentTypeId.value) return
  submitting.value = true
  clearErrors()
  try {
    const body: Record<string, unknown> = {
      student_id: selectedStudentId.value,
      punishment_type_id: selectedPunishmentTypeId.value,
    }
    if (dueAt.value) {
      const date = dueAt.value.toDate(getLocalTimeZone())
      if (dueAtTime.value) {
        const [h, m] = dueAtTime.value.split(':')
        date.setHours(Number(h), Number(m), 0, 0)
      }
      body.due_at = date.toISOString()
    }
    await $api('/punishments/', {
      method: 'POST',
      body,
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
        <DialogTitle>{{ t('modals.punishment.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.punishment.title') }}</DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="submit">
        <!-- Global error -->
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <!-- Classroom -->
        <div class="space-y-2">
          <Label>{{ t('modals.punishment.class') }}</Label>
          <ClassroomSelect v-model="selectedClassroomId" :classrooms="classrooms" full-width />
        </div>

        <!-- Student -->
        <div class="space-y-2">
          <Label>{{ t('modals.punishment.student') }}</Label>
          <StudentSelect
            v-model="selectedStudentId"
            :students="students"
            :placeholder="t('modals.punishment.selectStudent')"
            :search-placeholder="t('modals.punishment.searchStudent')"
            :empty-text="t('modals.punishment.noStudentFound')"
          />
          <p v-if="fieldErrors.student_id" class="text-sm text-destructive">{{ fieldErrors.student_id }}</p>
        </div>

        <!-- Punishment Type -->
        <div class="space-y-2">
          <Label>{{ t('modals.punishment.punishmentType') }}</Label>
          <PunishmentTypeSelect v-model="selectedPunishmentTypeId" :punishment-types="punishmentTypes" />
          <p v-if="fieldErrors.punishment_type_id" class="text-sm text-destructive">{{ fieldErrors.punishment_type_id }}</p>
        </div>

        <!-- Due date -->
        <div class="space-y-2">
          <Label>{{ t('modals.punishment.dueAt') }}</Label>
          <DatePicker
            v-model="dueAt"
            v-model:time="dueAtTime"
            :placeholder="t('modals.punishment.selectDate')"
            show-time
          />
          <p v-if="fieldErrors.due_at" class="text-sm text-destructive">{{ fieldErrors.due_at }}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
            {{ t('modals.punishment.cancel') }}
          </Button>
          <Button type="submit" class="cursor-pointer" :disabled="submitting || !selectedStudentId || !selectedPunishmentTypeId">
            {{ t('modals.punishment.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts">
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone } from '@internationalized/date'
</script>
