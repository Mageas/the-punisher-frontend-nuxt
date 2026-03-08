<script setup lang="ts">
const props = defineProps<{
  placeholder?: string
}>()

const { t } = useI18n()

const evaluationLabelPlaceholder = computed(
  () => props.placeholder ?? t('common.placeholders.evaluationLabel'),
)
</script>

<template>
  <FormField v-slot="{ componentField }" name="evaluation_label">
    <FormItem>
      <FormLabel>{{ t('common.labels.evaluationLabel') }}</FormLabel>
      <FormControl>
        <Input v-bind="componentField" type="text" :placeholder="evaluationLabelPlaceholder" />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
