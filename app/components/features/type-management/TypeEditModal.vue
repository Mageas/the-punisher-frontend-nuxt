<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  title: string
  item: { id: string; name: string } | null
  updateFn: (id: string, name: string) => Promise<unknown>
}>()

const { t } = useI18n()
const { globalError, handleApiError, setFormErrors, clearErrors } = useApiErrors()

const schema = toTypedSchema(zod.object({
  name: zod.string()
    .min(2, t('apiErrors.details.validation_min_length', { value: 2 }))
    .max(100, t('apiErrors.details.validation_max_length', { value: 100 })),
}))

const { handleSubmit, isSubmitting, resetForm, setFieldError, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    name: props.item?.name ?? '',
  },
})

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetForm({
      values: {
        name: props.item?.name ?? '',
      },
    })
  }
})

const onSubmit = handleSubmit(async (values) => {
  if (!props.item?.id) return
  clearErrors()
  try {
    await props.updateFn(props.item.id, values.name)
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
    :title="title"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="meta.valid"
    :submit-text="t('typeManagement.save')"
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>{{ t('typeManagement.name') }}</FormLabel>
        <FormControl>
          <Input
            type="text"
            :placeholder="t('typeManagement.name')"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
