<script setup lang="ts">
import type { DateValue } from '@internationalized/date'

const props = defineProps<{
  time?: string
  placeholder?: string
  onDateChange: (
    value: DateValue | undefined,
    handleChangeDate: (value: DateValue | undefined) => void,
  ) => void
  onTimeChange: (value: string) => void
}>()

const { t } = useI18n()

const occurredAtPlaceholder = computed(
  () => props.placeholder ?? t('common.placeholders.selectOccurredDate'),
)
const occurredAtTime = computed(() => props.time ?? '08:00')
</script>

<template>
  <FormField v-slot="{ value: dateValue, handleChange: handleChangeDate }" name="occurred_at">
    <FormItem>
      <FormLabel>{{ t('common.labels.occurredAt') }}</FormLabel>
      <FormControl>
        <DatePicker
          :model-value="dateValue"
          :time="occurredAtTime"
          :placeholder="occurredAtPlaceholder"
          show-time
          @update:model-value="(value) => props.onDateChange(value, handleChangeDate)"
          @update:time="props.onTimeChange"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
