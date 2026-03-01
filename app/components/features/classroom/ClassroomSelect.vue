<script setup lang="ts">
import type { Classroom } from '~/types/api'
import { computed } from 'vue'

const props = defineProps<{
  classrooms?: readonly Classroom[]
  fullWidth?: boolean
  selectedName?: string
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()
const classroomService = useClassroomService()

const options = computed(() =>
  (props.classrooms ?? []).map((classroom) => ({
    id: classroom.id,
    name: classroom.name,
  })),
)

const shouldUseRemoteOptions = computed(() => props.classrooms === undefined)

async function fetchClassroomOptions(options: { page: number; search?: string }) {
  const response = await classroomService.getClassrooms(options)

  return {
    ...response,
    data: response.data.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
    })),
  }
}
</script>

<template>
  <div :class="props.fullWidth ? 'w-full' : 'basis-full md:basis-auto md:w-[200px]'">
    <IdNameSearchInput
      v-model="modelValue"
      :options="options"
      :fetch-options="shouldUseRemoteOptions ? fetchClassroomOptions : undefined"
      :selected-label="props.selectedName"
      :placeholder="t('common.selectClassOptional')"
      :empty-text="t('common.noClassFound')"
    />
  </div>
</template>
