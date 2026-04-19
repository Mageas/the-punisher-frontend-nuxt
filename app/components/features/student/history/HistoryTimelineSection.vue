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

const sectionTitle = computed(() => props.title ?? t('common.titles.history'))
const sectionEmptyLabel = computed(() => props.emptyLabel ?? t('studentProfile.empty.history'))

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

function eventDateTime(item: StudentHistoryItem): string {
  return item.occurred_at ?? item.created_at
}
</script>

<template>
  <div>
    <SectionHeaderRow
      :title="sectionTitle"
      :page="props.page"
      :total-pages="props.totalPages"
      :loading="props.loading"
      :disabled="props.disabled"
      @update:page="emit('update:page', $event)"
    />

    <SectionListBlock
      :is-empty="history.length === 0"
      :empty-label="sectionEmptyLabel"
      list-class="space-y-0"
    >
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
                    ? 'text-success-foreground border-success-border'
                    : 'text-warning-foreground border-warning-border'
                "
              >
                {{ item.resolved_at ? t('common.states.resolved') : t('common.states.pending') }}
              </Badge>
            </div>
            <p
              v-if="isPunishmentAutomated(item)"
              class="mt-1 inline-flex items-center gap-1.5 text-xs text-info-foreground"
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
              {{ formatDateTime(eventDateTime(item)) }}
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
                    : 'bg-warning-bg-subtle text-warning-foreground'
                "
              >
                +{{ item.points }}
              </span>
              <Badge
                variant="outline"
                class="text-xs"
                :class="
                  item.used_at ? 'text-muted-foreground' : 'text-success-foreground border-success-border'
                "
              >
                {{ item.used_at ? t('common.states.used') : t('common.states.available') }}
              </Badge>
            </div>
            <p v-if="item.used_at" class="mt-1 text-xs text-muted-foreground">
              {{ t('bonuses.usedAt', { date: formatDate(item.used_at) }) }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ formatDateTime(eventDateTime(item)) }}
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
              {{ formatDateTime(eventDateTime(item)) }}
            </p>
          </template>
        </div>
      </div>
    </SectionListBlock>
  </div>
</template>
