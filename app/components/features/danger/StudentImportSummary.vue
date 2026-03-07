<script setup lang="ts">
import { CheckCircle, AlertTriangle, Users, School, Link2 } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { StudentImportSummary as StudentImportSummaryData } from '~/types/api'

interface StudentImportSummaryStatItem {
  key: string
  label: string
  value: number
  valueLabel: string
  footer: string
  highlighted: boolean
  icon: Component
}

const props = defineProps<{
  summary: StudentImportSummaryData
}>()

const { t } = useI18n()

const stats = computed<StudentImportSummaryStatItem[]>(() => [
  {
    key: 'students',
    label: t('common.titles.students'),
    value: props.summary.students_created,
    valueLabel: t('dangerZone.importStudents.summaryStudentsCreated'),
    footer: `${props.summary.students_existing} ${t('dangerZone.importStudents.summaryStudentsExisting')}`,
    highlighted: props.summary.students_created > 0,
    icon: Users,
  },
  {
    key: 'classrooms',
    label: t('common.titles.classes'),
    value: props.summary.classrooms_created,
    valueLabel: t('dangerZone.importStudents.summaryClassroomsCreated'),
    footer: `${props.summary.classrooms_existing} ${t('dangerZone.importStudents.summaryClassroomsExisting')}`,
    highlighted: props.summary.classrooms_created > 0,
    icon: School,
  },
  {
    key: 'links',
    label: t('dangerZone.importStudents.summaryLinks'),
    value: props.summary.links_created,
    valueLabel: t('dangerZone.importStudents.summaryStudentsCreated'),
    footer: `${props.summary.links_existing} ${t('dangerZone.importStudents.summaryStudentsExisting')}`,
    highlighted: props.summary.links_created > 0,
    icon: Link2,
  },
])
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-success-border"
    data-testid="student-import-summary"
  >
    <div
      class="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-success-border bg-success-bg-subtle px-4 py-2.5"
    >
      <CheckCircle class="size-4 shrink-0 text-success-foreground" />
      <span class="text-sm font-semibold text-success-foreground">
        {{ t('dangerZone.importStudents.successTitle') }}
      </span>
      <span class="text-xs text-success-foreground sm:ml-auto">
        {{
          t('dangerZone.importStudents.summaryProcessed', {
            processed: props.summary.rows_processed,
            total: props.summary.rows_total,
          })
        }}
      </span>
    </div>

    <div class="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <StudentImportSummaryStat
        v-for="stat in stats"
        :key="stat.key"
        :label="stat.label"
        :value="stat.value"
        :value-label="stat.valueLabel"
        :footer="stat.footer"
        :highlighted="stat.highlighted"
        :icon="stat.icon"
        :data-testid="`student-import-summary-stat-${stat.key}`"
      />
    </div>

    <div
      v-if="props.summary.rows_failed > 0"
      class="flex items-center gap-2 border-t border-destructive-border bg-destructive-bg-subtle px-4 py-2 text-xs font-medium text-destructive"
      data-testid="student-import-summary-failed-banner"
    >
      <AlertTriangle class="size-3.5" />
      {{ props.summary.rows_failed }}
      {{ t('dangerZone.importStudents.rowsFailed').toLowerCase() }}
    </div>
  </div>
</template>
