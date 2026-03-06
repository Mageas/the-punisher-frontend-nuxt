<script setup lang="ts">
import type { WeekPattern } from '~/types/api'

const { t } = useI18n()

const items: { key: WeekPattern; dotClass: string }[] = [
  { key: 'every_week', dotClass: 'bg-violet-500' },
  { key: 'even_weeks', dotClass: 'bg-info' },
  { key: 'odd_weeks', dotClass: 'bg-warning' },
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
    <span class="font-medium">{{ t('schedule.legend') }}</span>
    <span v-for="item in items" :key="item.key" class="flex items-center gap-1.5">
      <span :class="['h-2.5 w-2.5 rounded-full', item.dotClass]" />
      {{ t(`schedule.weekPatterns.${item.key}`) }}
    </span>
  </div>
</template>
