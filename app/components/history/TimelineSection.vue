<script setup lang="ts">
import type { StudentHistoryItem, StudentHistoryPunishmentItem } from '~/types/api'
import { formatDate, formatDateTime } from '~/lib/utils'

const props = defineProps<{
  history: StudentHistoryItem[]
  title?: string
  emptyLabel?: string
}>()

const { t } = useI18n()

const sectionTitle = computed(() => props.title ?? t('studentProfile.historyTitle'))
const sectionEmptyLabel = computed(() => props.emptyLabel ?? t('studentProfile.empty.history'))

function eventDotClass(item: StudentHistoryItem): string {
  if (item.type === 'bonus') return 'bg-amber-400'
  if (item.type === 'penalty') return 'bg-orange-400'
  return 'bg-red-400'
}

function isPunishmentAutomated(item: StudentHistoryPunishmentItem): boolean {
  return item.automated === true
}

function punishmentSubtitle(item: StudentHistoryPunishmentItem): string {
  if (item.triggering_rule_name) return item.triggering_rule_name
  if (isPunishmentAutomated(item)) return t('common.auto')
  return t('punishments.manualPunishment')
}
</script>

<template>
  <div>
    <h2 class="mb-4 text-lg font-semibold">
      {{ sectionTitle }}
    </h2>

    <div v-if="history.length === 0" class="rounded-lg border border-border p-6 text-sm text-muted-foreground">
      {{ sectionEmptyLabel }}
    </div>

    <div v-else class="space-y-0">
      <div v-for="(item, index) in history" :key="item.id" class="flex gap-4">
        <div class="flex flex-col items-center">
          <div class="timeline-dot mt-1.5 h-2 w-2 rounded-full" :class="eventDotClass(item)" />
          <div v-if="index < history.length - 1" class="my-1 w-px flex-1 bg-border" />
        </div>

        <div class="flex-1 pb-6" :class="{ 'pb-2': index === history.length - 1 }">
          <template v-if="item.type === 'punishment'">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-medium">
                {{
                  isPunishmentAutomated(item)
                    ? t('studentProfile.history.punishmentAuto', { name: item.punishment_type_name })
                    : t('studentProfile.history.punishment', { name: item.punishment_type_name })
                }}
              </p>
              <Badge
                v-if="isPunishmentAutomated(item)"
                variant="outline"
                class="text-xs text-blue-400 border-blue-400/30"
              >
                {{ t('common.auto') }}
              </Badge>
              <Badge
                variant="outline"
                class="text-xs"
                :class="item.resolved_at ? 'text-green-400 border-green-400/30' : 'text-amber-400 border-amber-400/30'"
              >
                {{ item.resolved_at ? t('punishments.resolved') : t('punishments.pending') }}
              </Badge>
            </div>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ punishmentSubtitle(item) }}
            </p>
            <p v-if="item.due_at" class="text-xs text-muted-foreground">
              {{ t('common.dueAt', { date: formatDate(item.due_at) }) }}
            </p>
            <p v-if="item.resolved_at" class="text-xs text-muted-foreground">
              {{ t('punishments.resolvedAt', { date: formatDate(item.resolved_at) }) }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ formatDateTime(item.created_at) }}
            </p>
          </template>

          <template v-else-if="item.type === 'bonus'">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-medium">
                {{ t('studentProfile.history.bonus', { name: item.bonus_type_name }) }}
              </p>
              <span
                class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold"
                :class="item.used_at ? 'bg-secondary text-muted-foreground' : 'bg-amber-400/10 text-amber-400'"
              >
                +{{ item.points }}
              </span>
              <Badge
                variant="outline"
                class="text-xs"
                :class="item.used_at ? 'text-muted-foreground' : 'text-green-400 border-green-400/30'"
              >
                {{ item.used_at ? t('common.used') : t('common.available') }}
              </Badge>
            </div>
            <p v-if="item.used_at" class="mt-1 text-xs text-muted-foreground">
              {{ t('bonuses.usedAt', { date: formatDate(item.used_at) }) }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ formatDateTime(item.created_at) }}
            </p>
          </template>

          <template v-else>
            <p class="text-sm font-medium">
              {{ t('studentProfile.history.penalty', { name: item.penalty_type_name }) }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ formatDateTime(item.created_at) }}
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
