<script setup lang="ts">
const { t } = useI18n()

const items = [
  { key: 'vacation', dotClass: 'bg-schedule-vacation' },
  { key: 'publicHoliday', dotClass: 'bg-schedule-holiday' },
] as const
</script>

<template>
  <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
    <span class="font-medium">{{ t('schedule.exceptions.legend') }}</span>
    <span v-for="item in items" :key="item.key" class="flex items-center gap-1.5">
      <span :class="['h-2.5 w-2.5 rounded-full', item.dotClass]" />
      {{ t(`schedule.exceptions.${item.key}`) }}
    </span>
  </div>
</template>
