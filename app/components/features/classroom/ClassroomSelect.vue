<script setup lang="ts">
import type { Classroom } from '~/types/api'
import { toIdNameOption } from '~/composables/useTrackedEntityFilterOptions'
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  classrooms?: readonly Classroom[]
  fullWidth?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  noneOptionLabel?: string
  noneValueLabel?: string
  selectedName?: string
}>()

const modelValue = defineModel<string>({ default: '' })
const attrs = useAttrs()

const { t } = useI18n()
const { fetchClassroomOptions } = useTrackedEntityFilterOptions()

const options = computed(() => (props.classrooms ?? []).map(toIdNameOption))
const shouldUseRemoteOptions = computed(() => props.classrooms === undefined)
const wrapperClass = computed(() =>
  props.fullWidth ? 'w-full' : 'basis-full md:basis-auto md:w-[200px]',
)
</script>

<template>
  <EntityRemoteSelect
    v-bind="attrs"
    v-model="modelValue"
    :options="options"
    :fetch-options="shouldUseRemoteOptions ? fetchClassroomOptions : undefined"
    :selected-name="props.selectedName"
    :placeholder="props.placeholder ?? t('common.placeholders.selectClassOptional')"
    :search-placeholder="props.searchPlaceholder ?? t('common.placeholders.searchClassroom')"
    :empty-text="props.emptyText ?? t('common.empty.noClasses')"
    :none-option-label="props.noneOptionLabel ?? t('common.options.allClassrooms')"
    :none-value-label="props.noneValueLabel ?? t('common.placeholders.selectClassOptional')"
    :wrapper-class="wrapperClass"
  />
</template>
