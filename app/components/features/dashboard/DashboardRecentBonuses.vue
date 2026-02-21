<script setup lang="ts">
import type { DashboardBonus } from '~/types/api'

defineProps<{
  bonuses: DashboardBonus[]
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">{{ t('dashboard.recentBonuses') }}</h2>
      <Badge variant="outline" class="text-muted-foreground">{{ t('common.recent') }}</Badge>
    </div>
    <div class="space-y-3">
      <BonusCard
        v-for="bonus in bonuses"
        :key="bonus.id"
        :bonus-type-name="bonus.bonus_type_name"
        :points="bonus.points"
        :used-at="bonus.used_at"
        :created-at="bonus.created_at"
        :student-id="bonus.student_id"
        :student-first-name="bonus.student_first_name"
        :student-last-name="bonus.student_last_name"
      />
    </div>
  </div>
</template>
