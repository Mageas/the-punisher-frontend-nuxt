<script setup lang="ts">
import { AlertCircle, Gavel, Star, Users } from 'lucide-vue-next'
import type { DashboardKpis } from '~/types/api'
import KpiCard from '~/components/shared/KpiCard.vue'
import KpiCardGrid from '~/components/shared/KpiCardGrid.vue'
import { formatRatio } from '~/lib/kpi-formatters'

const props = defineProps<{
  kpis: DashboardKpis
}>()

const { t } = useI18n()

const cards = computed(() => [
  {
    key: 'studentCount',
    label: t('common.titles.students'),
    value: props.kpis.student_count,
    icon: Users,
    iconClass: 'text-muted-foreground',
    valueClass: '',
    subtitle: t('common.inSelection'),
  },
  {
    key: 'availableBonusPoints',
    label: t('common.kpis.availableBonusPoints'),
    value: formatRatio(props.kpis.available_bonus_points, props.kpis.total_bonus_points),
    icon: Star,
    iconClass: 'text-warning-foreground',
    valueClass: 'text-warning-foreground',
    subtitle: t('common.unusedBonus', props.kpis.unused_bonus_count),
  },
  {
    key: 'penaltyCount',
    label: t('common.titles.penalties'),
    value: props.kpis.penalty_count,
    icon: AlertCircle,
    iconClass: 'text-muted-foreground',
    valueClass: '',
    subtitle: t('common.currentPeriod'),
  },
  {
    key: 'pendingPunishmentCount',
    label: t('common.titles.pendingPunishments'),
    value: formatRatio(props.kpis.pending_punishment_count, props.kpis.total_punishment_count),
    icon: Gavel,
    iconClass: 'text-danger-foreground',
    valueClass: 'text-danger-foreground',
    subtitle: t('common.overduePunishments', props.kpis.overdue_punishment_count),
  },
])
</script>

<template>
  <KpiCardGrid class="mb-8 sm:grid-cols-2 xl:grid-cols-4">
    <KpiCard
      v-for="card in cards"
      :key="card.key"
      :label="card.label"
      :value="card.value"
      :subtitle="card.subtitle"
      :icon="card.icon"
      :icon-class="card.iconClass"
      :value-class="card.valueClass"
    />
  </KpiCardGrid>
</template>
