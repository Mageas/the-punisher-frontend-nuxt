<script setup lang="ts">
import { AlertCircle, Star, Users } from 'lucide-vue-next'
import type { Classroom } from '~/types/api'

const props = defineProps<{
  classroom: Classroom
}>()

const { t } = useI18n()

const cards = computed(() => [
  {
    key: 'studentCount',
    label: t('classProfile.kpis.studentCount'),
    value: props.classroom.student_count,
    icon: Users,
    iconClass: 'text-muted-foreground',
    valueClass: '',
    subtitle: '',
  },
  {
    key: 'availableBonusPoints',
    label: t('classProfile.kpis.availableBonusPoints'),
    value: props.classroom.total_bonus_points,
    icon: Star,
    iconClass: 'text-amber-400',
    valueClass: 'text-amber-400',
    subtitle: t('classProfile.kpis.classTotal'),
  },
  {
    key: 'totalPenaltyCount',
    label: t('classProfile.kpis.totalPenaltyCount'),
    value: props.classroom.total_penalty_count,
    icon: AlertCircle,
    iconClass: 'text-muted-foreground',
    valueClass: '',
    subtitle: t('classProfile.kpis.classTotal'),
  },
])
</script>

<template>
  <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div
      v-for="card in cards"
      :key="card.key"
      class="rounded-lg border border-border p-6"
    >
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm font-medium text-muted-foreground">
          {{ card.label }}
        </p>
        <component :is="card.icon" class="w-4 h-4" :class="card.iconClass" />
      </div>
      <p class="text-3xl font-bold" :class="card.valueClass">
        {{ card.value }}
      </p>
      <p v-if="card.subtitle" class="mt-1 text-xs text-muted-foreground">
        {{ card.subtitle }}
      </p>
    </div>
  </div>
</template>
