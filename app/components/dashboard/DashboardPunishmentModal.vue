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
const { punishmentTypes, fetchAllPunishmentTypes } = usePunishmentTypes()

// Form
const selectedClassroomId = ref('')
const selectedStudentId = ref('')
const selectedPunishmentTypeId = ref('')
const dueAt = ref<DateValue>()
const dueAtTime = ref('08:00')
const submitting = ref(false)
const openPunishmentTypePopover = ref(false)

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
    selectedPunishmentTypeId.value = ''
    dueAt.value = undefined
    dueAtTime.value = '08:00'
    await Promise.all([fetchAllClassrooms(), fetchAllStudents(), fetchAllPunishmentTypes()])
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
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('modals.punishment.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.punishment.title') }}</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="submit">
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
          <Popover v-model:open="openPunishmentTypePopover">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                class="w-full justify-between font-normal cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                <span class="truncate">
                  {{ punishmentTypes.find(pt => pt.id === selectedPunishmentTypeId)?.name ?? t('modals.punishment.selectPunishmentType') }}
                </span>
                <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-[--reka-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput :placeholder="t('modals.punishment.searchPunishmentType')" />
                <CommandList>
                  <CommandEmpty>{{ t('modals.punishment.noPunishmentTypeFound') }}</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      v-for="pt in punishmentTypes"
                      :key="pt.id"
                      :value="pt.name"
                      class="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      @select="selectedPunishmentTypeId = pt.id; openPunishmentTypePopover = false"
                    >
                      <CheckIcon
                        :class="cn(
                          'mr-2 h-4 w-4',
                          selectedPunishmentTypeId === pt.id ? 'opacity-100' : 'opacity-0',
                        )"
                      />
                      {{ pt.name }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
</script>
