<script setup lang="ts">
import type { DashboardPenalty } from '~/types/api'

const props = defineProps<{
  penalties: DashboardPenalty[]
  badgeText?: string
  badgeHelpText?: string
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">
        {{ t('dashboard.recentPenalties') }}
      </h2>
      <KpiInfoBadge
        v-if="props.badgeText"
        :text="props.badgeText"
        :help-text="props.badgeHelpText"
        badge-class="text-muted-foreground"
      />
    </div>
    <div class="space-y-3">
      <PenaltyCard
        v-for="penalty in penalties"
        :key="penalty.id"
        :penalty-type-name="penalty.penalty_type_name"
        :created-at="penalty.created_at"
        :student-id="penalty.student_id"
        :student-first-name="penalty.student_first_name"
        :student-last-name="penalty.student_last_name"
      />
    </div>
  </div>
</template>
