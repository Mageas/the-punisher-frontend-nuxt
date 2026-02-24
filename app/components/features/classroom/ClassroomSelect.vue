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
  props.classrooms.map((classroom) => ({
    id: classroom.id,
    name: classroom.name,
  })),
)
</script>

<template>
  <div :class="props.fullWidth ? 'w-full' : 'basis-full md:basis-auto md:w-[200px]'">
    <IdNameSearchInput
      v-model="modelValue"
      :options="options"
      :placeholder="t('common.selectClassOptional')"
      :empty-text="t('common.noClassFound')"
    />
  </div>
</template>
