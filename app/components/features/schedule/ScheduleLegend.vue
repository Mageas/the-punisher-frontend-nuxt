<script setup lang="ts">
import { SCHEDULE_WEEK_PATTERN_VISUALS } from '~/lib/schedule-week-patterns'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
    <span class="font-medium">{{ t('schedule.legend') }}</span>
    <span
      v-for="pattern in SCHEDULE_WEEK_PATTERN_VISUALS"
      :key="pattern.value"
      class="flex items-center gap-1.5"
    >
      <span :class="['h-2.5 w-2.5 rounded-full', pattern.dotClass]" />
      {{ t(`schedule.weekPatterns.${pattern.value}`) }}
    </span>
  </div>
</template>
