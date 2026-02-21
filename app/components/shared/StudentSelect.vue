<script setup lang="ts">
import type { Student } from '~/types/api'
import { computed } from 'vue'

const props = defineProps<{
  students: readonly Student[]
  placeholder?: string
  emptyText?: string
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()

const options = computed(() =>
  props.students.map((student) => ({
    id: student.id,
    name: `${student.first_name} ${student.last_name}`,
  })),
)
</script>

<template>
  <IdNameSearchInput
    v-model="modelValue"
    :options="options"
    :placeholder="props.placeholder ?? t('modals.penalty.selectStudent')"
    :empty-text="props.emptyText ?? t('modals.penalty.noStudentFound')"
  />
</template>
