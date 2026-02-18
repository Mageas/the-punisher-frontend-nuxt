<script setup lang="ts">
import type { Classroom } from '~/types/api'
import { computed } from 'vue'

const props = defineProps<{
  classrooms: readonly Classroom[]
  fullWidth?: boolean
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()

const options = computed(() =>
  props.classrooms.map(classroom => ({
    id: classroom.id,
    name: classroom.name,
  })),
)
</script>

<template>
  <IdNameSelect
    v-model="modelValue"
    :options="options"
    :placeholder="t('common.allStudents')"
    :search-placeholder="t('common.searchClass')"
    :empty-text="t('common.noClassFound')"
    :none-option-label="t('common.allStudents')"
    :none-value-label="t('common.allStudents')"
    :full-width="props.fullWidth ?? false"
  />
</template>
