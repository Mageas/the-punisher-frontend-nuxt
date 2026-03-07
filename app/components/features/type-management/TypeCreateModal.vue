<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  title: string
  placeholder: string
  createFn: (name: string) => Promise<unknown>
}>()

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const { isPending: submitLoading, withPending: withSubmitLoading } = useApiActionState()

const schema = toTypedSchema(
  zod.object({
    name: zod
      .string()
      .min(2, t('apiErrors.details.validation_min_length', { value: 2 }))
      .max(100, t('apiErrors.details.validation_max_length', { value: 100 })),
  }),
)

const { handleSubmit, resetForm, setFieldError, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
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
      await props.createFn(values.name)
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
    :title="title"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="meta.valid"
    :submit-text="t('common.actions.create')"
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>{{ t('common.labels.name') }}</FormLabel>
        <FormControl>
          <Input type="text" :placeholder="props.placeholder" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
