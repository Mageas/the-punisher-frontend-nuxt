<script setup lang="ts">
import type { DashboardKpis } from '~/types/api'
import { Users, Star, AlertCircle, Gavel } from 'lucide-vue-next'

const props = defineProps<{
  kpis: DashboardKpis
}>()

const { t } = useI18n()

const cards = computed(() => [
  {
    label: t('dashboard.kpiStudents'),
    value: props.kpis.student_count,
    icon: Users,
    iconClass: 'text-muted-foreground',
    valueClass: '',
    subtitle: t('common.inSelection'),
  },
  {
    label: t('dashboard.kpiBonusPoints'),
    value: props.kpis.available_bonus_points,
    icon: Star,
    iconClass: 'text-amber-400',
    valueClass: 'text-amber-400',
    subtitle: t('common.unusedBonus', props.kpis.unused_bonus_count),
  },
  {
    label: t('dashboard.kpiPenalties'),
    value: props.kpis.penalty_count,
    icon: AlertCircle,
    iconClass: 'text-muted-foreground',
    valueClass: '',
    subtitle: t('common.currentPeriod'),
  },
  {
    label: t('dashboard.kpiPendingPunishments'),
    value: props.kpis.pending_punishment_count,
    icon: Gavel,
    iconClass: 'text-muted-foreground',
    valueClass: 'text-red-400',
    subtitle: t('common.toResolve'),
  },
])
</script>

<template>
  <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.label"
      class="border border-border rounded-lg p-6"
    >
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm font-medium text-muted-foreground">{{ card.label }}</p>
        <component :is="card.icon" class="w-4 h-4" :class="card.iconClass" />
      </div>
      <p class="text-3xl font-bold" :class="card.valueClass">
        {{ card.value }}
      </p>
      <p class="text-xs text-muted-foreground mt-1">{{ card.subtitle }}</p>
    </div>
  </div>
</template>
