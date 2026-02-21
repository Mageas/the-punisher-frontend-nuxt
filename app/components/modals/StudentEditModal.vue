<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  studentId: string | null
  firstName: string
  lastName: string
}>()

const { t } = useI18n()
const { $api } = useNuxtApp()
const { globalError, handleApiError, setFormErrors, clearErrors } = useApiErrors()

const schema = toTypedSchema(zod.object({
  first_name: zod.string()
    .min(2, t('apiErrors.details.validation_min_length', { value: 2 }))
    .max(70, t('apiErrors.details.validation_max_length', { value: 70 })),
  last_name: zod.string()
    .min(2, t('apiErrors.details.validation_min_length', { value: 2 }))
    .max(70, t('apiErrors.details.validation_max_length', { value: 70 })),
}))

const { handleSubmit, isSubmitting, resetForm, setFieldError, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    first_name: props.firstName,
    last_name: props.lastName,
  },
})

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetForm({
      values: {
        first_name: props.firstName,
        last_name: props.lastName,
      },
    })
  }
})

const onSubmit = handleSubmit(async (values) => {
  if (!props.studentId) return
  clearErrors()
  try {
    await $api(`/students/${props.studentId}`, {
      method: 'PUT',
      body: values,
    })
    open.value = false
    emit('updated')
  }
  catch (err) {
    setFormErrors(setFieldError, err)
  }
})
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="t('modals.student.editTitle')"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="meta.valid"
    :submit-text="t('modals.student.save')"
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="last_name">
      <FormItem>
        <FormLabel>{{ t('modals.student.lastName') }}</FormLabel>
        <FormControl>
          <Input
            type="text"
            :placeholder="t('modals.student.lastNamePlaceholder')"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="first_name">
      <FormItem>
        <FormLabel>{{ t('modals.student.firstName') }}</FormLabel>
        <FormControl>
          <Input
            type="text"
            :placeholder="t('modals.student.firstNamePlaceholder')"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
