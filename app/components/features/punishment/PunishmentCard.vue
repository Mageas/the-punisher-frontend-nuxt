<script setup lang="ts">
import { Gavel, Scale } from 'lucide-vue-next'
import { formatDate } from '~/lib/utils'

const props = defineProps<{
  punishmentTypeName: string
  automated: boolean
  triggeringRuleId?: string | null
  triggeringRuleName?: string | null
  evaluationLabel?: string | null
  dueAt?: string | null
  resolvedAt?: string | null
  studentId?: string
  studentFirstName?: string
  studentLastName?: string
  compact?: boolean
}>()

const { t } = useI18n()

const isAutomated = computed(() => props.automated === true)
const isOverdue = computed(
  () => !props.resolvedAt && props.dueAt && new Date(props.dueAt) < new Date(),
)
const hasRuleName = computed(() => Boolean(props.triggeringRuleName))
const hasRuleLink = computed(
  () => isAutomated.value && hasRuleName.value && Boolean(props.triggeringRuleId),
)
const rulesLink = computed(() =>
  props.triggeringRuleId ? `/rules?ruleId=${props.triggeringRuleId}` : '/rules',
)

const automatedLabel = computed(() => {
  if (!isAutomated.value) return ''
  if (hasRuleName.value && props.triggeringRuleName) {
    return t('punishments.autoByRule', { name: props.triggeringRuleName })
  }
  return t('punishments.deletedRule')
})

const secondaryLine = computed(() => {
  return props.punishmentTypeName
})
const stateLabel = computed(() => {
  if (props.resolvedAt) return t('common.states.resolved')
  if (isOverdue.value) return t('filters.overdue')
  return t('common.states.pending')
})
const stateTone = computed<'success' | 'warning' | 'destructive'>(() => {
  if (props.resolvedAt) return 'success'
  if (isOverdue.value) return 'destructive'
  return 'warning'
})
const stateDescription = computed(() => {
  if (!props.resolvedAt && props.dueAt) {
    return t('common.dueAt', { date: formatDate(props.dueAt) })
  }

  if (props.resolvedAt) {
    return t('punishments.resolvedAt', { date: formatDate(props.resolvedAt) })
  }

  return undefined
})
</script>

<template>
  <ResponsiveEventCardLayout :compact="props.compact" :dimmed="Boolean(props.resolvedAt)">
    <template #icon>
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-bg-subtle"
      >
        <Gavel class="h-4 w-4 text-danger" />
      </div>
    </template>

    <template #title>
      <StudentEventTitle
        :fallback-label="props.punishmentTypeName"
        :student-id="props.studentId"
        :student-first-name="props.studentFirstName"
        :student-last-name="props.studentLastName"
      />
    </template>

    <template #mobile-meta>
      <StudentEventMeta v-if="secondaryLine">
        {{ secondaryLine }}
      </StudentEventMeta>
      <StudentEventMeta v-if="props.evaluationLabel" tone="default">
        <span class="truncate italic">« {{ props.evaluationLabel }} »</span>
      </StudentEventMeta>
      <StudentEventMeta v-if="isAutomated" inline tone="info">
        <template #icon>
          <Scale class="h-3 w-3 shrink-0" />
        </template>
        <NuxtLink
          v-if="hasRuleLink"
          :to="rulesLink"
          class="truncate transition-colors hover:text-primary hover:underline underline-offset-4"
        >
          {{ automatedLabel }}
        </NuxtLink>
        <span v-else class="truncate">{{ automatedLabel }}</span>
      </StudentEventMeta>
    </template>

    <template #desktop-meta>
      <StudentEventMeta v-if="secondaryLine || props.evaluationLabel" inline class="min-w-0">
        <span v-if="secondaryLine">{{ secondaryLine }}</span>
        <template v-if="props.evaluationLabel">
          <span v-if="secondaryLine" class="mx-1.5">·</span>
          <span class="truncate italic">« {{ props.evaluationLabel }} »</span>
        </template>
        <template v-if="isAutomated">
          <span class="mx-1.5">·</span>
          <span class="inline-flex min-w-0 items-center gap-1 text-info-foreground">
            <Scale class="h-3 w-3 shrink-0" />
            <NuxtLink
              v-if="hasRuleLink"
              :to="rulesLink"
              class="transition-colors hover:text-primary hover:underline underline-offset-4"
            >
              {{ automatedLabel }}
            </NuxtLink>
            <span v-else>{{ automatedLabel }}</span>
          </span>
        </template>
      </StudentEventMeta>
    </template>

    <template #status>
      <StudentEventStatus
        :label="stateLabel"
        :description="stateDescription"
        :tone="stateTone"
        desktop-align-right
      />
    </template>

    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </ResponsiveEventCardLayout>
</template>
