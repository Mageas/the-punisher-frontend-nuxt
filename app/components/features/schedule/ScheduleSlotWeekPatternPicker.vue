<script setup lang="ts">
import type { WeekPattern } from '~/types/api'
import { SCHEDULE_WEEK_PATTERN_VISUALS } from '~/lib/schedule-week-patterns'

const props = withDefaults(
  defineProps<{
    error?: string
  }>(),
  {
    error: '',
  },
)

const weekPattern = defineModel<WeekPattern>('weekPattern', {
  default: 'every_week',
})

const { t } = useI18n()
</script>

<template>
  <div class="space-y-2">
    <Label>{{ t('schedule.form.weekPattern') }}</Label>
    <div class="grid grid-cols-3 gap-2" data-testid="schedule-slot-week-pattern-picker">
      <button
        v-for="option in SCHEDULE_WEEK_PATTERN_VISUALS"
        :key="option.value"
        type="button"
        :class="[
          'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all',
          weekPattern === option.value
            ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
            : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/50',
        ]"
        :data-testid="`schedule-slot-week-pattern-${option.value}`"
        @click="weekPattern = option.value"
      >
        <span :class="['h-2 w-2 shrink-0 rounded-full', option.dotClass]" />
        {{ t(`schedule.weekPatternsShort.${option.value}`) }}
      </button>
    </div>
    <p v-if="props.error" class="text-sm text-destructive">
      {{ props.error }}
    </p>
  </div>
</template>
