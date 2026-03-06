<script setup lang="ts">
import type { WeekPattern } from '~/types/api'

const { t } = useI18n()

const items: { key: WeekPattern; dotClass: string }[] = [
  { key: 'every_week', dotClass: 'bg-primary' },
  { key: 'even_weeks', dotClass: 'bg-info' },
  { key: 'odd_weeks', dotClass: 'bg-warning' },
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <span class="text-xs font-medium text-muted-foreground">{{ t('schedule.legend') }}</span>
    <div v-for="item in items" :key="item.key" class="flex items-center gap-1.5">
      <span :class="['h-2.5 w-2.5 rounded-full', item.dotClass]" />
      <span class="text-xs text-muted-foreground">
        {{ t(`schedule.weekPatterns.${item.key}`) }}
      </span>
    </div>
  </div>
</template>
