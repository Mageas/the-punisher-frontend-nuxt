<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <div class="py-8 text-center text-muted-foreground" data-testid="schedule-exception-empty-state">
    <CalendarDays class="mx-auto mb-2 h-8 w-8 opacity-50" />
    <p>{{ t('schedule.exceptions.empty') }}</p>
    <p class="mt-1 text-sm">{{ t('schedule.exceptions.emptyHint') }}</p>
  </div>
</template>
