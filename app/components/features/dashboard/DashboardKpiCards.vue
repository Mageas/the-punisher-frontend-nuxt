<script setup lang="ts">
import type { DashboardKpis } from '~/types/api'
import { Users } from 'lucide-vue-next'
import KpiCard from '~/components/shared/KpiCard.vue'
import KpiCardGrid from '~/components/shared/KpiCardGrid.vue'

const props = defineProps<{
  kpis: DashboardKpis
}>()

const { t } = useI18n()

const cards = computed(() => [
  {
    key: 'studentCount',
    label: t('common.titles.students'),
    value: props.kpis.student_count,
    subtitle: t('common.inSelection'),
    icon: Users,
    iconClass: 'text-muted-foreground',
    valueClass: '',
  },
])
</script>

<template>
  <KpiCardGrid class="sm:max-w-sm">
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
