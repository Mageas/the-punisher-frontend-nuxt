<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const { isPending: submitLoading, withPending: withSubmitLoading } = useApiActionState()
const classroomService = useClassroomService()

const schema = toTypedSchema(
  zod.object({
    name: zod
      .string()
      .min(2, t('apiErrors.details.validation_min_length', { value: 2 }))
      .max(100, t('apiErrors.details.validation_max_length', { value: 100 })),
    year: zod
      .string()
      .max(20, t('apiErrors.details.validation_max_length', { value: 20 }))
      .optional()
      .or(zod.literal('')),
  }),
)

const { handleSubmit, resetForm, setFieldError, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    year: '',
  },
})

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetForm()
  }
})

const onSubmit = handleSubmit(async (values) => {
  clearErrors()
  try {
    await withSubmitLoading(async () => {
      await classroomService.createClassroom({
        name: values.name,
        year: values.year || null,
      })
      open.value = false
      emit('created')
    })
  } catch (err) {
    setFormErrors(setFieldError, err)
  }
})
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="t('modals.classroom.title')"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="meta.valid"
    :submit-text="t('common.actions.create')"
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>{{ t('modals.classroom.name') }}</FormLabel>
        <FormControl>
          <Input
            type="text"
            :placeholder="t('common.placeholders.classroomName')"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="year">
      <FormItem>
        <FormLabel>{{ t('modals.classroom.year') }}</FormLabel>
        <FormControl>
          <Input
            type="text"
            :placeholder="t('common.placeholders.schoolYear')"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
