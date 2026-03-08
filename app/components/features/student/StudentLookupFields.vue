<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    showClassroomLookup?: boolean
    lookupClassroomId?: string | null
  }>(),
  {
    showClassroomLookup: true,
    lookupClassroomId: '',
  },
)

const emit = defineEmits<{
  'update:studentLookupClassroomId': [value: string]
}>()

const { t } = useI18n()

const studentOptionsScopeKey = computed(() => props.lookupClassroomId || '__all_students__')
</script>

<template>
  <FormField v-if="props.showClassroomLookup" v-slot="{ value }" name="student_lookup_classroom_id">
    <FormItem>
      <FormLabel>{{ t('common.labels.classroom') }}</FormLabel>
      <FormControl>
        <ClassroomSelect
          :model-value="value"
          full-width
          @update:model-value="emit('update:studentLookupClassroomId', $event)"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>

  <FormField v-slot="{ value, handleChange }" name="student_id">
    <FormItem>
      <FormLabel>{{ t('common.labels.student') }}</FormLabel>
      <FormControl>
        <StudentSelect
          :key="studentOptionsScopeKey"
          :model-value="value"
          :classroom-id="props.lookupClassroomId || null"
          :options-scope-key="studentOptionsScopeKey"
          :placeholder="t('common.placeholders.selectStudent')"
          :empty-text="t('common.empty.noStudents')"
          :full-width="true"
          @update:model-value="handleChange"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
