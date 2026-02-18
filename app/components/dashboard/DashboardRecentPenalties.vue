<script setup lang="ts">
import type { DashboardPenalty } from '~/types/api'

defineProps<{
  penalties: DashboardPenalty[]
}>()

const { t } = useI18n()

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">{{ t('dashboard.recentPenalties') }}</h2>
      <Badge variant="outline" class="text-muted-foreground">{{ t('common.recent') }}</Badge>
    </div>
    <div class="space-y-3">
      <div
        v-for="penalty in penalties"
        :key="penalty.id"
        class="flex items-center gap-3 p-3 rounded-lg border border-border"
      >
        <StudentAvatar
          :first-name="penalty.student_first_name"
          :last-name="penalty.student_last_name"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">{{ penalty.student_first_name }} {{ penalty.student_last_name }}</p>
          <p class="text-xs text-muted-foreground">{{ penalty.penalty_type_name }}</p>
        </div>
        <span class="text-xs text-muted-foreground">{{ formatTime(penalty.created_at) }}</span>
      </div>
    </div>
  </div>
</template>
