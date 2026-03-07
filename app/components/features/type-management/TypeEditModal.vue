<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { buildDelta } from '~/lib/delta'

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
  const item = props.item
  if (!item?.id) return
  clearErrors()
  try {
    const deltaPayload = buildDelta({ name: item.name }, { name: values.name })

    if ('name' in deltaPayload) {
      await withSubmitLoading(async () => {
        await props.updateFn(item.id, values.name)
        emit('updated')
      })
    }

    open.value = false
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
    :submit-text="t('common.actions.save')"
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>{{ t('common.labels.name') }}</FormLabel>
        <FormControl>
          <Input type="text" :placeholder="t('common.labels.name')" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
