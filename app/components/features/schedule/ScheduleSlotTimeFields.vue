<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    timeOptions: string[]
    endTimeOptions: string[]
    startTimeError?: string
    endTimeError?: string
  }>(),
  {
    startTimeError: '',
    endTimeError: '',
  },
)

const startTime = defineModel<string>('startTime', { default: '' })
const endTime = defineModel<string>('endTime', { default: '' })
const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <div class="space-y-2">
      <Label>{{ t('schedule.form.startTime') }}</Label>
      <NativeSelect v-model="startTime" class="w-full">
        <NativeSelectOption value="" disabled> --:-- </NativeSelectOption>
        <NativeSelectOption v-for="time in props.timeOptions" :key="time" :value="time">
          {{ time }}
        </NativeSelectOption>
      </NativeSelect>
      <p v-if="props.startTimeError" class="text-sm text-destructive">
        {{ props.startTimeError }}
      </p>
    </div>

    <div class="space-y-2">
      <Label>{{ t('schedule.form.endTime') }}</Label>
      <NativeSelect v-model="endTime" class="w-full">
        <NativeSelectOption value="" disabled> --:-- </NativeSelectOption>
        <NativeSelectOption v-for="time in props.endTimeOptions" :key="time" :value="time">
          {{ time }}
        </NativeSelectOption>
      </NativeSelect>
      <p v-if="props.endTimeError" class="text-sm text-destructive">
        {{ props.endTimeError }}
      </p>
    </div>
  </div>
</template>
