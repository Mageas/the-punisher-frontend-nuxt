<script setup lang="ts">
import type { DashboardBonus } from '~/types/api'

const props = defineProps<{
  bonuses: DashboardBonus[]
  badgeText?: string
  badgeHelpText?: string
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <SectionHeaderRow
      :title="t('common.titles.recentBonuses')"
      :badge-text="props.badgeText"
      :badge-help-text="props.badgeHelpText"
      badge-class="text-muted-foreground"
      :show-pagination="false"
    />
    <SectionListBlock
      :is-empty="props.bonuses.length === 0"
      :empty-label="t('common.empty.noBonuses')"
      list-class="space-y-3"
    >
      <BonusCard
        v-for="bonus in bonuses"
        :key="bonus.id"
        :bonus-type-name="bonus.bonus_type_name"
        :points="bonus.points"
        :used-at="bonus.used_at"
        :occurred-at="bonus.occurred_at ?? bonus.created_at"
        :created-at="bonus.created_at"
        :student-id="bonus.student_id"
        :student-first-name="bonus.student_first_name"
        :student-last-name="bonus.student_last_name"
      />
    </SectionListBlock>
  </div>
</template>
