<script setup lang="ts">
import {
  type ScheduleSlot,
  type ScheduleSlotCreateData,
  type Weekday,
} from '~/types/api'
import { Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  scheduleSlot?: ScheduleSlot | null
  prefillWeekday?: Weekday | null
  prefillStartTime?: string | null
  prefillEndTime?: string | null
  saveFn: (data: ScheduleSlotCreateData) => Promise<ScheduleSlot>
}>()

const emit = defineEmits<{
  saved: [slot: ScheduleSlot]
  delete: [slotId: string]
}>()

const open = defineModel<boolean>('open', { default: false })
const { t } = useI18n()
const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()
const { isPending: submitting, withPending: withSubmitting } = useApiActionState()
const { notifyCreateSuccess, notifyUpdateSuccess } = useActionToast()

const isEditMode = computed(() => !!props.scheduleSlot)
const {
  form,
  selectedClassrooms,
  weekdayOptions,
  timeOptions,
  endTimeOptions,
  clientErrors,
  fetchClassroomOptions,
  addClassroom,
  removeClassroom,
  validateForm,
  getSubmitData,
} = useScheduleSlotForm({
  open,
  scheduleSlot: computed(() => props.scheduleSlot),
  prefillWeekday: computed(() => props.prefillWeekday),
  prefillStartTime: computed(() => props.prefillStartTime),
  prefillEndTime: computed(() => props.prefillEndTime),
  clearErrors,
  t,
})

async function handleSubmit() {
  if (submitting.value) return

  if (!validateForm()) {
    return
  }

  clearErrors()

  try {
    const savedSlot = await withSubmitting(() => props.saveFn(getSubmitData()))

    if (isEditMode.value) {
      notifyUpdateSuccess()
    } else {
      notifyCreateSuccess()
    }

    open.value = false
    emit('saved', savedSlot)
  } catch (err) {
    handleApiError(err)

    if (globalError.value) {
      toast.error(globalError.value, {
        position: 'top-center',
        richColors: true,
      })
      clearErrors()
    }
  }
}

function handleDelete() {
  if (props.scheduleSlot) {
    emit('delete', props.scheduleSlot.id)
  }
}
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="isEditMode ? t('schedule.form.editTitle') : t('schedule.form.createTitle')"
    :submitting="submitting"
    :submit-text="isEditMode ? t('common.actions.save') : t('common.actions.create')"
    hide-footer
    prevent-auto-focus
    @submit="handleSubmit"
  >
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label>{{ t('schedule.form.weekday') }}</Label>
        <NativeSelect v-model="form.weekday" class="w-full">
          <NativeSelectOption value="" disabled>
            {{ t('schedule.form.selectWeekday') }}
          </NativeSelectOption>
          <NativeSelectOption v-for="day in weekdayOptions" :key="day" :value="day">
            {{ t(`schedule.weekdays.${day}`) }}
          </NativeSelectOption>
        </NativeSelect>
        <p v-if="clientErrors.weekday || fieldErrors.weekday" class="text-sm text-destructive">
          {{ clientErrors.weekday || fieldErrors.weekday }}
        </p>
      </div>

      <ScheduleSlotTimeFields
        v-model:start-time="form.start_time"
        v-model:end-time="form.end_time"
        :time-options="timeOptions"
        :end-time-options="endTimeOptions"
        :start-time-error="clientErrors.start_time || fieldErrors.start_time"
        :end-time-error="clientErrors.end_time || fieldErrors.end_time"
      />

      <ScheduleSlotWeekPatternPicker
        v-model:week-pattern="form.week_pattern"
        :error="fieldErrors.week_pattern"
      />

      <ScheduleSlotClassroomPicker
        :selected-classrooms="selectedClassrooms"
        :fetch-options="fetchClassroomOptions"
        :error="clientErrors.classroom_ids || fieldErrors.classroom_ids"
        :disabled="submitting"
        @add-classroom="addClassroom"
        @remove-classroom="removeClassroom"
      />

      <div class="flex items-center gap-2 pt-2">
        <Button
          v-if="isEditMode"
          type="button"
          variant="ghost"
          size="icon"
          class="cursor-pointer text-danger hover:text-danger"
          :title="t('common.actions.delete')"
          :disabled="submitting"
          @click="handleDelete"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
        <div class="flex-1" />
        <Button
          type="button"
          variant="outline"
          class="cursor-pointer"
          :disabled="submitting"
          @click="open = false"
        >
          {{ t('common.actions.cancel') }}
        </Button>
        <LoadingButton type="submit" class="cursor-pointer" :loading="submitting">
          {{ isEditMode ? t('common.actions.save') : t('common.actions.create') }}
        </LoadingButton>
      </div>
    </form>
  </BaseModal>
</template>
