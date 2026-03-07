<script setup lang="ts">
interface ClassroomOption {
  id: string
  name: string
}

const props = withDefaults(
  defineProps<{
    show?: boolean
    classrooms: readonly ClassroomOption[]
    selectedClassroomId?: string | null
    loading?: boolean
    hint: string
  }>(),
  {
    show: true,
    selectedClassroomId: '',
    loading: false,
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  select: [classroomId: string]
}>()
</script>

<template>
  <FormField v-if="props.show" v-slot="{}" name="classroom_id">
    <FormItem class="space-y-0">
      <StudentClassroomSelector
        v-model:open="open"
        :classrooms="props.classrooms"
        :selected-classroom-id="props.selectedClassroomId"
        :loading="props.loading"
        :hint="props.hint"
        @select="emit('select', $event)"
      />
      <FormMessage />
    </FormItem>
  </FormField>
</template>
