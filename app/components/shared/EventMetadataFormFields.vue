<script setup lang="ts">
import type { DateValue } from '@internationalized/date'

const props = defineProps<{
  occurredAtTime?: string
  occurredAtPlaceholder?: string
  evaluationLabelPlaceholder?: string
  onOccurredAtDateChange: (
    value: DateValue | undefined,
    handleChangeDate: (value: DateValue | undefined) => void,
  ) => void
  onOccurredAtTimeChange: (value: string) => void
}>()
</script>

<template>
  <OccurredAtField
    :time="props.occurredAtTime"
    :placeholder="props.occurredAtPlaceholder"
    :on-date-change="props.onOccurredAtDateChange"
    :on-time-change="props.onOccurredAtTimeChange"
  />
  <EvaluationLabelField :placeholder="props.evaluationLabelPlaceholder" />
</template>
