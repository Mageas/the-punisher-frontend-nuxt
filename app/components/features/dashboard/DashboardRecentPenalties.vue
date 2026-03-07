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
    <SectionHeaderRow
      :title="t('common.titles.recentPenalties')"
      :badge-text="props.badgeText"
      :badge-help-text="props.badgeHelpText"
      badge-class="text-muted-foreground"
      :show-pagination="false"
    />
    <SectionListBlock
      :is-empty="props.penalties.length === 0"
      :empty-label="t('common.empty.noPenalties')"
      list-class="space-y-3"
    >
      <PenaltyCard
        v-for="penalty in penalties"
        :key="penalty.id"
        :penalty-type-name="penalty.penalty_type_name"
        :occurred-at="penalty.occurred_at ?? penalty.created_at"
        :created-at="penalty.created_at"
        :student-id="penalty.student_id"
        :student-first-name="penalty.student_first_name"
        :student-last-name="penalty.student_last_name"
      />
    </SectionListBlock>
  </div>
</template>
