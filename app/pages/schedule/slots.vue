<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  SCHEDULE_WEEKDAYS,
  type ScheduleSlot,
  type ScheduleSlotCreateData,
  type Weekday,
} from '~/types/api'

const { t } = useI18n()
useSeoMeta({ title: () => t('common.titles.schedule.slot') })

const scheduleService = useScheduleService()
const {
  globalError: fetchError,
  handleApiError: handleFetchError,
  clearErrors: clearFetchErrors,
} = useApiErrors()

const weekdays: Weekday[] = [...SCHEDULE_WEEKDAYS]
const slots = ref<ScheduleSlot[]>([])
const loading = ref(false)
const hasFetchError = ref(false)

const showSlotModal = ref(false)
const showDeleteModal = ref(false)
const editingSlot = ref<ScheduleSlot | null>(null)
const prefillWeekday = ref<Weekday | null>(null)
const prefillStartTime = ref<string | null>(null)
const prefillEndTime = ref<string | null>(null)
const slotToDeleteId = ref<string | null>(null)

function openCreateModal(weekday?: Weekday, startTime?: string, endTime?: string) {
  editingSlot.value = null
  prefillWeekday.value = weekday || null
  prefillStartTime.value = startTime || null
  prefillEndTime.value = endTime || null
  showSlotModal.value = true
}

function openEditModal(slot: ScheduleSlot) {
  editingSlot.value = slot
  prefillWeekday.value = null
  prefillStartTime.value = null
  prefillEndTime.value = null
  showSlotModal.value = true
}

async function fetchScheduleSlots() {
  loading.value = true
  hasFetchError.value = false
  clearFetchErrors()

  try {
    slots.value = await scheduleService.getScheduleSlots()
  } catch (err) {
    handleFetchError(err)
    toast.error(fetchError.value || t('apiErrors.messages.internal_error'), {
      position: 'top-center',
      richColors: true,
    })
    clearFetchErrors()
    hasFetchError.value = true
  } finally {
    loading.value = false
  }
}

async function saveSlot(data: ScheduleSlotCreateData) {
  if (editingSlot.value) {
    return await scheduleService.updateScheduleSlot(editingSlot.value.id, data)
  }

  return await scheduleService.createScheduleSlot(data)
}

function onDeleteRequest(slotId: string) {
  slotToDeleteId.value = slotId
  showSlotModal.value = false
  showDeleteModal.value = true
}

async function deleteSlot(id: string) {
  await scheduleService.deleteScheduleSlot(id)
}

async function onSaved() {
  editingSlot.value = null
  await fetchScheduleSlots()
}

async function onDeleteConfirmed() {
  slotToDeleteId.value = null
  editingSlot.value = null
  await fetchScheduleSlots()
}

await fetchScheduleSlots()
</script>

<template>
  <div>
    <PageHeaderBar align="center">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('common.titles.schedule.slot') }}
        </h1>
      </template>

      <template #actions>
        <Button class="w-full cursor-pointer justify-center md:w-auto" @click="openCreateModal()">
          <Plus class="h-4 w-4" />
          {{ t('schedule.addSlot') }}
        </Button>
      </template>
    </PageHeaderBar>

    <div v-if="loading" class="py-16 text-center text-muted-foreground">
      {{ t('schedule.loading') }}
    </div>

    <template v-else-if="!hasFetchError || slots.length > 0">
      <div class="mb-6">
        <ScheduleLegend />
      </div>

      <ScheduleTimetable
        :slots="slots"
        :weekdays="weekdays"
        :start-hour="6"
        :end-hour="20"
        :step-minutes="15"
        @click-slot="openEditModal"
        @click-empty="(day, start, end) => openCreateModal(day, start, end)"
        @drag-create="(day, start, end) => openCreateModal(day, start, end)"
      />

      <div v-if="slots.length === 0" class="py-16 text-center text-muted-foreground">
        {{ t('schedule.empty') }}
      </div>
    </template>

    <ScheduleSlotModal
      v-model:open="showSlotModal"
      :schedule-slot="editingSlot"
      :prefill-weekday="prefillWeekday"
      :prefill-start-time="prefillStartTime"
      :prefill-end-time="prefillEndTime"
      :save-fn="saveSlot"
      @saved="onSaved"
      @delete="onDeleteRequest"
    />

    <ScheduleSlotDeleteModal
      v-model:open="showDeleteModal"
      :slot-id="slotToDeleteId"
      :delete-fn="deleteSlot"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>
