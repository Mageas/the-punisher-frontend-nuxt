<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { ScheduleException } from '~/types/api'
import { parseDate } from '@internationalized/date'
import { CalendarRange, Landmark, Palmtree, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const scheduleService = useScheduleService()
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

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

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

const selectionTitle = computed(() => {
  return editingException.value
    ? t('schedule.exceptions.editing')
    : t('schedule.exceptions.selectedRange')
})

const selectionBarBorderClass = computed(() => {
  return editingException.value
    ? 'border-amber-300 dark:border-amber-700'
    : 'border-violet-300 dark:border-violet-700'
})

const calendarHint = computed(() => {
  return editingException.value || hasCompleteSelection.value
    ? t('schedule.exceptions.editingHint')
    : t('schedule.exceptions.selectHint')
})

function formatDateValue(date: DateValue): string {
  const jsDate = new Date(`${date.toString()}T00:00:00`)
  return dateFormatter.format(jsDate)
}

function getSelectionDayCount(): number {
  if (!selectedRange.value?.start || !selectedRange.value?.end) return 0
  const s = new Date(`${selectedRange.value.start.toString()}T00:00:00`)
  const e = new Date(`${selectedRange.value.end.toString()}T00:00:00`)
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

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
    } else {
      const createdException = await scheduleService.createScheduleException({
        type,
        start_date: selectedRange.value.start.toString(),
        end_date: selectedRange.value.end.toString(),
      })

      exceptions.value.push(createdException)
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
      <!-- Legend -->
      <div class="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span class="font-medium">{{ t('schedule.exceptions.legend') }}</span>
        <span class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          {{ t('schedule.exceptions.vacation') }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-rose-500" />
          {{ t('schedule.exceptions.publicHoliday') }}
        </span>
      </div>

      <div>
        <ScheduleExceptionYearView
          v-model="selectedRange"
          :exceptions="exceptions"
          @edit-exception="startEditingException"
        />
      </div>

      <!-- Floating selection action bar -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-full"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-full"
        >
          <div
            v-if="showSelectionBar"
            class="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4 sm:px-4 sm:pb-6"
          >
            <div
              :class="selectionBarBorderClass"
              class="relative w-full max-w-2xl rounded-xl border-2 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sm:flex sm:items-center sm:gap-4 sm:px-5 sm:py-3.5"
            >
              <!-- Close button (top-right on mobile, inline on sm+) -->
              <Button
                size="icon"
                variant="ghost"
                class="absolute right-2 top-2 h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground sm:static sm:order-last sm:shrink-0"
                @click="clearSelection"
              >
                <X class="h-3.5 w-3.5" />
                <span class="sr-only">{{ t('schedule.exceptions.cancelSelection') }}</span>
              </Button>

              <!-- Date range info -->
              <div class="mb-3 flex items-center gap-3 pr-8 sm:mb-0 sm:min-w-0 sm:flex-1 sm:pr-0">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <CalendarRange class="h-4.5 w-4.5" />
                </div>
                <div class="min-w-0">
                  <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {{ selectionTitle }}
                  </p>
                  <p v-if="editingException" class="mb-1 text-xs text-muted-foreground">
                    {{ t('schedule.exceptions.editingHint') }}
                  </p>
                  <p class="text-sm font-medium leading-tight">
                    {{ formatDateValue(selectedRange!.start!) }}
                    <template v-if="selectedRange?.end">
                      — {{ formatDateValue(selectedRange!.end!) }}
                    </template>
                  </p>
                  <p v-if="hasCompleteSelection" class="text-xs text-muted-foreground">
                    {{ t('schedule.exceptions.dayCount', getSelectionDayCount()) }}
                  </p>
                </div>
              </div>

              <!-- Action buttons -->
              <div v-if="hasCompleteSelection" class="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  class="flex-1 cursor-pointer gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 sm:flex-none dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  @click="saveException('vacation')"
                >
                  <Palmtree class="h-3.5 w-3.5" />
                  {{ t('schedule.exceptions.addAsVacation') }}
                </Button>
                <Button
                  size="sm"
                  class="flex-1 cursor-pointer gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-50 sm:flex-none dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950"
                  variant="outline"
                  @click="saveException('public_holiday')"
                >
                  <Landmark class="h-3.5 w-3.5" />
                  {{ t('schedule.exceptions.addAsHoliday') }}
                </Button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

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
      :cancel-label="t('common.actions.cancel')"
      :confirm-label="t('common.actions.delete')"
      confirm-variant="destructive"
      error-mode="toast"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>
