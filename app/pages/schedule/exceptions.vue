<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { ScheduleException } from '~/types/api'
import { parseDate } from '@internationalized/date'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const { formatDateValue, getExceptionDayCount } = useScheduleExceptionFormatting()
const scheduleService = useScheduleService()
const { notifyCreateSuccess, notifyUpdateSuccess } = useActionToast()
const {
  fieldErrors: exceptionFieldErrors,
  globalError: exceptionError,
  handleApiError: handleExceptionError,
  clearErrors: clearExceptionErrors,
} = useApiErrors()

const exceptions = ref<ScheduleException[]>([])
const loading = ref(false)
const selectedRange = ref<{ start: DateValue | undefined; end: DateValue | undefined }>()
const editingException = ref<ScheduleException | null>(null)
const exceptionToDeleteId = ref<string | null>(null)
const showDeleteModal = ref(false)

const sortedExceptions = computed(() => {
  return [...exceptions.value].sort((a, b) => a.start_date.localeCompare(b.start_date))
})

const hasCompleteSelection = computed(() => {
  return !!selectedRange.value?.start && !!selectedRange.value?.end
})

const hasActiveSelection = computed(() => {
  return !!selectedRange.value?.start || !!selectedRange.value?.end
})

const showSelectionBar = computed(() => {
  return hasCompleteSelection.value || !!editingException.value
})

const calendarHint = computed(() => {
  return editingException.value || hasCompleteSelection.value
    ? t('schedule.exceptions.editingHint')
    : t('schedule.exceptions.selectHint')
})

const selectionStartLabel = computed(() =>
  selectedRange.value?.start ? formatDateValue(selectedRange.value.start) : '',
)

const selectionEndLabel = computed(() =>
  selectedRange.value?.end ? formatDateValue(selectedRange.value.end) : null,
)

const selectionDayCount = computed(() => {
  if (!selectedRange.value?.start || !selectedRange.value?.end) return 0

  return getExceptionDayCount(
    selectedRange.value.start.toString(),
    selectedRange.value.end.toString(),
  )
})

function notifyExceptionError(err: unknown) {
  handleExceptionError(err)

  const firstFieldError = Object.values(exceptionFieldErrors.value)[0]
  const message = exceptionError.value || firstFieldError || t('apiErrors.messages.internal_error')

  toast.error(message, {
    position: 'top-center',
    richColors: true,
  })
  clearExceptionErrors()
}

async function fetchScheduleExceptions() {
  loading.value = true
  clearExceptionErrors()

  try {
    exceptions.value = await scheduleService.getScheduleExceptions()
  } catch (err) {
    notifyExceptionError(err)
  } finally {
    loading.value = false
  }
}

async function saveException(type: 'vacation' | 'public_holiday') {
  if (!selectedRange.value?.start || !selectedRange.value?.end) return

  clearExceptionErrors()

  try {
    if (editingException.value) {
      const updatedException = await scheduleService.updateScheduleException(
        editingException.value.id,
        {
          type,
          start_date: selectedRange.value.start.toString(),
          end_date: selectedRange.value.end.toString(),
        },
      )

      exceptions.value = exceptions.value.map((exception) =>
        exception.id === updatedException.id ? updatedException : exception,
      )
      notifyUpdateSuccess()
    } else {
      const createdException = await scheduleService.createScheduleException({
        type,
        start_date: selectedRange.value.start.toString(),
        end_date: selectedRange.value.end.toString(),
      })

      exceptions.value.push(createdException)
      notifyCreateSuccess()
    }

    clearSelection()
  } catch (err) {
    notifyExceptionError(err)
  }
}

function clearSelection() {
  selectedRange.value = undefined
  editingException.value = null
}

function startEditingException(exception: ScheduleException) {
  editingException.value = exception
  selectedRange.value = {
    start: parseDate(exception.start_date),
    end: parseDate(exception.end_date),
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !hasActiveSelection.value) return
  clearSelection()
}

function requestDelete(id: string) {
  exceptionToDeleteId.value = id
  showDeleteModal.value = true
}

async function deleteException(id: string) {
  await scheduleService.deleteScheduleException(id)
  exceptions.value = exceptions.value.filter((e) => e.id !== id)

  if (editingException.value?.id === id) {
    clearSelection()
  }
}

function onDeleteConfirmed() {
  exceptionToDeleteId.value = null
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

await fetchScheduleExceptions()
</script>

<template>
  <div>
    <PageHeaderBar align="center">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('common.titles.schedule.exception') }}
        </h1>
      </template>
    </PageHeaderBar>

    <div v-if="loading" class="py-16 text-center text-muted-foreground">
      {{ t('schedule.exceptions.loading') }}
    </div>

    <template v-else>
      <div class="mb-6">
        <ScheduleExceptionLegend />
      </div>

      <div>
        <ScheduleExceptionYearView
          v-model="selectedRange"
          :exceptions="exceptions"
          @edit-exception="startEditingException"
        />
      </div>

      <ScheduleExceptionSelectionBar
        :open="showSelectionBar"
        :is-editing="Boolean(editingException)"
        :has-complete-selection="hasCompleteSelection"
        :start-label="selectionStartLabel"
        :end-label="selectionEndLabel"
        :day-count="selectionDayCount"
        @close="clearSelection"
        @save-vacation="saveException('vacation')"
        @save-holiday="saveException('public_holiday')"
      />

      <div
        class="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted-foreground"
      >
        <p>{{ calendarHint }}</p>
        <p v-if="showSelectionBar">
          {{ t('schedule.exceptions.editingExitHint') }}
        </p>
      </div>

      <!-- Exception List -->
      <div class="mt-8">
        <h2 v-if="exceptions.length > 0" class="mb-4 text-lg font-semibold">
          {{ t('schedule.exceptions.listTitle') }}
        </h2>
        <ScheduleExceptionList
          :exceptions="sortedExceptions"
          @select="startEditingException"
          @delete="requestDelete"
        />
      </div>
    </template>

    <ConfirmActionModal
      v-model:open="showDeleteModal"
      :item-id="exceptionToDeleteId"
      :action-fn="deleteException"
      :title="t('schedule.exceptions.deleteTitle')"
      :message="t('schedule.exceptions.deleteMessage')"
      :success-message="t('common.feedback.deleteSuccess')"
      :cancel-label="t('common.actions.cancel')"
      :confirm-label="t('common.actions.delete')"
      confirm-variant="destructive"
      error-mode="toast"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>
