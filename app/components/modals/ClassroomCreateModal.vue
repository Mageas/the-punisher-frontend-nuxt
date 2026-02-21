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
  name: zod.string()
    .min(2, t('apiErrors.details.validation_min_length', { value: 2 }))
    .max(100, t('apiErrors.details.validation_max_length', { value: 100 })),
  year: zod.string()
    .max(20, t('apiErrors.details.validation_max_length', { value: 20 }))
    .optional()
    .or(zod.literal('')),
}))

const { handleSubmit, isSubmitting, resetForm, setFieldError, meta } = useForm({
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
    await $api('/classrooms/', {
      method: 'POST',
      body: {
        name: values.name,
        year: values.year || null,
      },
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
    :title="t('modals.classroom.title')"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="meta.valid"
    :submit-text="t('modals.classroom.submit')"
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>{{ t('modals.classroom.name') }}</FormLabel>
        <FormControl>
          <Input
            type="text"
            :placeholder="t('modals.classroom.namePlaceholder')"
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
            :placeholder="t('modals.classroom.yearPlaceholder')"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
