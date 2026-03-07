<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { IdNameOption, IdNameOptionsFetcher } from '~/composables/useLazyIdNameOptions'

const props = withDefaults(
  defineProps<{
    selectedClassrooms: readonly IdNameOption[]
    fetchOptions: IdNameOptionsFetcher
    error?: string
    disabled?: boolean
  }>(),
  {
    error: '',
    disabled: false,
  },
)

const emit = defineEmits<{
  'add-classroom': [classroom: IdNameOption | null]
  'remove-classroom': [id: string]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-2">
    <Label>{{ t('schedule.form.classrooms') }}</Label>

    <div v-if="props.selectedClassrooms.length > 0" class="flex flex-wrap gap-1.5">
      <Badge
        v-for="classroom in props.selectedClassrooms"
        :key="classroom.id"
        variant="secondary"
        class="gap-1 pr-1"
      >
        {{ classroom.name }}
        <button
          type="button"
          class="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          :disabled="props.disabled"
          :data-testid="`schedule-slot-remove-classroom-${classroom.id}`"
          @click="emit('remove-classroom', classroom.id)"
        >
          <span class="sr-only">{{ t('common.actions.remove') }}</span>
          <X class="h-3 w-3" />
        </button>
      </Badge>
    </div>

    <p v-else class="text-sm text-muted-foreground">
      {{ t('schedule.form.noClassroomSelected') }}
    </p>

    <IdNameSelect
      :model-value="''"
      :fetch-options="props.fetchOptions"
      :placeholder="t('schedule.form.classroomPlaceholder')"
      :search-placeholder="t('schedule.form.classroomSearch')"
      :empty-text="t('schedule.form.classroomEmpty')"
      :disabled="props.disabled"
      keep-focus-on-select
      @selected-option="emit('add-classroom', $event)"
    />

    <p v-if="props.error" class="text-sm text-destructive">
      {{ props.error }}
    </p>
  </div>
</template>
