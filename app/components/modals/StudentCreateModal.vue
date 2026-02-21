<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

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
    first_name: '',
    last_name: '',
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
    await $api('/students/', {
      method: 'POST',
      body: values,
    })
    open.value = false
    emit('created')
  }
  catch (err) {
    setFormErrors(setFieldError, err)
  }
})
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="t('modals.student.title')"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="meta.valid"
    :submit-text="t('modals.student.submit')"
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
