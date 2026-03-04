<script setup lang="ts">
import { Scale } from 'lucide-vue-next'
import type { StudentHistoryItem, StudentHistoryPunishmentItem } from '~/types/api'
import { formatDate, formatDateTime } from '~/lib/utils'

const props = defineProps<{
  history: StudentHistoryItem[]
  title?: string
  emptyLabel?: string
  page?: number
  totalPages?: number
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:page': [value: number]
}>()

const { t } = useI18n()

const sectionTitle = computed(() => props.title ?? t('studentProfile.historyTitle'))
const sectionEmptyLabel = computed(() => props.emptyLabel ?? t('studentProfile.empty.history'))
const currentPage = computed(() => props.page ?? 1)
const currentTotalPages = computed(() => props.totalPages ?? 1)
const paginationLoading = computed(() => props.loading ?? false)
const paginationDisabled = computed(() => props.disabled ?? false)

function eventDotClass(item: StudentHistoryItem): string {
  if (item.type === 'bonus') return 'bg-warning'
  if (item.type === 'penalty') return 'bg-caution'
  return 'bg-danger'
}

function isPunishmentAutomated(item: StudentHistoryPunishmentItem): boolean {
  return item.automated === true
}

function punishmentOrigin(item: StudentHistoryPunishmentItem): string {
  if (!isPunishmentAutomated(item)) return ''
  if (item.triggering_rule_name)
    return t('punishments.autoByRule', { name: item.triggering_rule_name })
  return t('punishments.deletedRule')
}

function hasRuleLink(item: StudentHistoryPunishmentItem): boolean {
  return (
    isPunishmentAutomated(item) &&
    Boolean(item.triggering_rule_id) &&
    Boolean(item.triggering_rule_name)
  )
}

function ruleLink(item: StudentHistoryPunishmentItem): string {
  return item.triggering_rule_id ? `/rules?ruleId=${item.triggering_rule_id}` : '/rules'
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-3">
        <h2 class="text-lg font-semibold">
          {{ sectionTitle }}
        </h2>
        <SectionHeaderPagination
          :page="currentPage"
          :total-pages="currentTotalPages"
          :loading="paginationLoading"
          :disabled="paginationDisabled"
          @update:page="emit('update:page', $event)"
        />
      </div>
    </div>

    <div
      v-if="history.length === 0"
      class="rounded-lg border border-border p-6 text-sm text-muted-foreground"
    >
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
                  t('studentProfile.history.punishment', {
                    name: item.punishment_type_name,
                  })
                }}
              </p>
              <Badge
                variant="outline"
                class="text-xs"
                :class="
                  item.resolved_at
                    ? 'text-success border-success-border'
                    : 'text-warning border-warning-border'
                "
              >
                {{ item.resolved_at ? t('punishments.resolved') : t('punishments.pending') }}
              </Badge>
            </div>
            <p
              v-if="isPunishmentAutomated(item)"
              class="mt-1 inline-flex items-center gap-1.5 text-xs text-info"
            >
              <Scale class="h-3 w-3 shrink-0" />
              <NuxtLink
                v-if="hasRuleLink(item)"
                :to="ruleLink(item)"
                class="transition-colors hover:text-primary hover:underline underline-offset-4"
              >
                {{ punishmentOrigin(item) }}
              </NuxtLink>
              <span v-else>
                {{ punishmentOrigin(item) }}
              </span>
            </p>
            <p v-if="item.due_at" class="text-xs text-muted-foreground">
              {{ t('common.dueAt', { date: formatDate(item.due_at) }) }}
            </p>
            <p v-if="item.resolved_at" class="text-xs text-muted-foreground">
              {{
                t('punishments.resolvedAt', {
                  date: formatDate(item.resolved_at),
                })
              }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ formatDateTime(item.created_at) }}
            </p>
          </template>

          <template v-else-if="item.type === 'bonus'">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-medium">
                {{
                  t('studentProfile.history.bonus', {
                    name: item.bonus_type_name,
                  })
                }}
              </p>
              <span
                class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold"
                :class="
                  item.used_at
                    ? 'bg-secondary text-muted-foreground'
                    : 'bg-warning-bg-subtle text-warning'
                "
              >
                +{{ item.points }}
              </span>
              <Badge
                variant="outline"
                class="text-xs"
                :class="
                  item.used_at ? 'text-muted-foreground' : 'text-success border-success-border'
                "
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
              {{
                t('studentProfile.history.penalty', {
                  name: item.penalty_type_name,
                })
              }}
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
