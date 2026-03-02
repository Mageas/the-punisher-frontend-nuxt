<script setup lang="ts">
import { AlertCircle, Gavel, Star, Users } from 'lucide-vue-next'
import type { DashboardKpis } from '~/types/api'

const props = defineProps<{
  kpis: DashboardKpis
}>()

const { t } = useI18n()

function formatRatio(current: number, total: number): string {
  return `${current} / ${total}`
}

const cards = computed(() => [
  {
    key: 'studentCount',
    label: t('classProfile.kpis.studentCount'),
    value: props.kpis.student_count,
    icon: Users,
    iconClass: 'text-muted-foreground',
    valueClass: '',
    subtitle: t('common.inSelection'),
  },
  {
    key: 'availableBonusPoints',
    label: t('classProfile.kpis.availableBonusPoints'),
    value: formatRatio(props.kpis.available_bonus_points, props.kpis.total_bonus_points),
    icon: Star,
    iconClass: 'text-warning',
    valueClass: 'text-warning',
    subtitle: t('common.unusedBonus', props.kpis.unused_bonus_count),
  },
  {
    key: 'penaltyCount',
    label: t('classProfile.kpis.penaltyCount'),
    value: props.kpis.penalty_count,
    icon: AlertCircle,
    iconClass: 'text-muted-foreground',
    valueClass: '',
    subtitle: t('common.currentPeriod'),
  },
  {
    key: 'pendingPunishmentCount',
    label: t('classProfile.kpis.pendingPunishmentCount'),
    value: formatRatio(props.kpis.pending_punishment_count, props.kpis.total_punishment_count),
    icon: Gavel,
    iconClass: 'text-danger',
    valueClass: 'text-danger',
    subtitle: t('common.overduePunishments', props.kpis.overdue_punishment_count),
  },
])
</script>

<template>
  <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div v-for="card in cards" :key="card.key" class="rounded-lg border border-border p-4 sm:p-6">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-xs sm:text-sm font-medium text-muted-foreground">
          {{ card.label }}
        </p>
        <component :is="card.icon" class="w-4 h-4" :class="card.iconClass" />
      </div>
      <p
        class="text-xl sm:text-3xl font-bold tabular-nums whitespace-nowrap leading-none"
        :class="card.valueClass"
      >
        {{ card.value }}
      </p>
      <p v-if="card.subtitle" class="mt-1 text-[11px] sm:text-xs text-muted-foreground">
        {{ card.subtitle }}
      </p>
    </div>
  </div>
</template>
