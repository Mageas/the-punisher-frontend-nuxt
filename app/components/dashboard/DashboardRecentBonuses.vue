<script setup lang="ts">
import type { DashboardBonus } from '~/types/api'

defineProps<{
  bonuses: DashboardBonus[]
}>()

const { t } = useI18n()

function formatPoints(points: number): string {
  return points === 1 ? `+${points} pt` : `+${points} pts`
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">{{ t('dashboard.recentBonuses') }}</h2>
      <Badge variant="outline" class="text-muted-foreground">{{ t('common.recent') }}</Badge>
    </div>
    <div class="space-y-3">
      <div
        v-for="bonus in bonuses"
        :key="bonus.id"
        class="flex items-center gap-3 p-3 rounded-lg border border-border"
      >
        <StudentAvatar
          :first-name="bonus.student_first_name"
          :last-name="bonus.student_last_name"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">{{ bonus.student_first_name }} {{ bonus.student_last_name }}</p>
          <p class="text-xs text-muted-foreground">{{ bonus.bonus_type_name }}</p>
        </div>
        <span
          :class="[
            'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold',
            bonus.used_at
              ? 'bg-secondary text-muted-foreground'
              : 'bg-amber-400/10 text-amber-400',
          ]"
        >
          {{ formatPoints(bonus.points) }}
        </span>
        <Badge
          variant="outline"
          :class="bonus.used_at ? 'text-muted-foreground' : 'text-green-400 border-green-400/30'"
        >
          {{ bonus.used_at ? t('common.used') : t('common.available') }}
        </Badge>
      </div>
    </div>
  </div>
</template>
