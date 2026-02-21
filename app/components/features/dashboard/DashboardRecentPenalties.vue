<script setup lang="ts">
import type { DashboardPenalty } from '~/types/api'

defineProps<{
  penalties: DashboardPenalty[]
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">
        {{ t('dashboard.recentPenalties') }}
      </h2>
      <Badge variant="outline" class="text-muted-foreground">{{ t('common.recent') }}</Badge>
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
