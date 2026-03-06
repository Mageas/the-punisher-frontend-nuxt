<script setup lang="ts">
import type { DashboardKpis } from '~/types/api'
import { Users } from 'lucide-vue-next'

const props = defineProps<{
  kpis: DashboardKpis
}>()

const { t } = useI18n()

const studentCard = computed(() => ({
  label: t('common.titles.students'),
  value: props.kpis.student_count,
  subtitle: t('common.inSelection'),
}))
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:max-w-sm">
    <div class="border border-border rounded-lg p-4 sm:p-6">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs sm:text-sm font-medium text-muted-foreground">
          {{ studentCard.label }}
        </p>
        <Users class="w-4 h-4 text-muted-foreground" />
      </div>
      <p class="text-xl sm:text-3xl font-bold tabular-nums whitespace-nowrap leading-none">
        {{ studentCard.value }}
      </p>
      <p class="text-[11px] sm:text-xs text-muted-foreground mt-1">{{ studentCard.subtitle }}</p>
    </div>
  </div>
</template>
