<script setup lang="ts">
import type { DashboardPunishment } from '~/types/api'
import { CircleCheck } from 'lucide-vue-next'

const props = defineProps<{
  punishments: DashboardPunishment[]
}>()

const emit = defineEmits<{
  resolve: [id: string]
}>()

const { t, d } = useI18n()

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">{{ t('dashboard.pendingPunishments') }}</h2>
      <Badge variant="outline" class="text-red-400 border-red-400/30">
        {{ t('common.nToResolve', { count: punishments.length }) }}
      </Badge>
    </div>
    <div class="space-y-3">
      <div
        v-for="punishment in punishments"
        :key="punishment.id"
        class="flex items-center gap-3 p-3 rounded-lg border border-border"
      >
        <StudentAvatar
          :first-name="punishment.student_first_name"
          :last-name="punishment.student_last_name"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium">
              {{ punishment.student_first_name }} {{ punishment.student_last_name }}
            </p>
            <Badge
              v-if="punishment.triggering_rule_id"
              variant="outline"
              class="text-blue-400 border-blue-400/30 text-xs"
            >
              {{ t('common.auto') }}
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ punishment.punishment_type_name }}
            <template v-if="punishment.due_at">
              — {{ t('common.dueAt', { date: formatDueDate(punishment.due_at) }) }}
            </template>
          </p>
        </div>
        <button
          class="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-secondary cursor-pointer"
          :title="t('common.resolve')"
          @click="emit('resolve', punishment.id)"
        >
          <CircleCheck class="w-5 h-5 text-green-400" />
        </button>
      </div>
    </div>
  </div>
</template>
