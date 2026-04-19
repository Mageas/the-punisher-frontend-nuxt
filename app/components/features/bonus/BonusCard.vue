<script setup lang="ts">
import { formatDate } from '~/lib/utils'

const props = defineProps<{
  bonusTypeName: string
  points: number
  usedAt?: string | null
  occurredAt?: string | null
  createdAt?: string | null
  evaluationLabel?: string | null
  studentId?: string
  studentFirstName?: string
  studentLastName?: string
}>()

const { t } = useI18n()

const hasStudentName = computed(() => Boolean(props.studentFirstName && props.studentLastName))
const displayedDate = computed(() => props.occurredAt ?? props.createdAt)
const formattedPoints = computed(() => `+${props.points}`)
const pointsBadgeClass = computed(() =>
  props.usedAt ? 'bg-secondary text-secondary-foreground' : 'bg-warning-bg-subtle text-warning-foreground',
)
const secondaryLine = computed(() => {
  if (hasStudentName.value) return props.bonusTypeName
  return ''
})
const stateLabel = computed(() =>
  props.usedAt ? t('common.states.used') : t('common.states.available'),
)
const stateDescription = computed(() => {
  if (props.usedAt) {
    return t('bonuses.usedAt', { date: formatDate(props.usedAt) })
  }
  if (displayedDate.value) {
    return formatDate(displayedDate.value)
  }
  return undefined
})
</script>

<template>
  <ResponsiveEventCardLayout :dimmed="Boolean(props.usedAt)">
    <template #icon>
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        :class="pointsBadgeClass"
      >
        {{ formattedPoints }}
      </div>
    </template>

    <template #title>
      <StudentEventTitle
        :fallback-label="props.bonusTypeName"
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
    </template>

    <template #desktop-meta>
      <StudentEventMeta v-if="secondaryLine || props.evaluationLabel" inline class="min-w-0">
        <span v-if="secondaryLine">{{ secondaryLine }}</span>
        <template v-if="props.evaluationLabel">
          <span v-if="secondaryLine" class="mx-1.5">·</span>
          <span class="truncate italic">« {{ props.evaluationLabel }} »</span>
        </template>
      </StudentEventMeta>
    </template>

    <template #status>
      <StudentEventStatus
        :label="stateLabel"
        :description="stateDescription"
        :tone="props.usedAt ? 'muted' : 'success'"
        desktop-align-right
      />
    </template>

    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </ResponsiveEventCardLayout>
</template>
