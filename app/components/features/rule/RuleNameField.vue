<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
  }>(),
  {
    label: undefined,
    placeholder: undefined,
  },
)

const { t } = useI18n()

const resolvedLabel = computed(() => props.label ?? t('common.labels.name'))
</script>

<template>
  <FormField v-slot="{ componentField }" name="name">
    <FormItem>
      <FormLabel>{{ resolvedLabel }}</FormLabel>
      <FormControl>
        <Input v-bind="componentField" type="text" :placeholder="props.placeholder" />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
