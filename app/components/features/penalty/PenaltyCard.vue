<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { formatDate } from '~/lib/utils'

const props = defineProps<{
  penaltyTypeName: string
  evaluationLabel?: string | null
  occurredAt?: string
  createdAt: string
  studentId?: string
  studentFirstName?: string
  studentLastName?: string
}>()

const hasStudentName = computed(() => Boolean(props.studentFirstName && props.studentLastName))
const displayedDate = computed(() => props.occurredAt ?? props.createdAt)
const secondaryLine = computed(() => {
  if (hasStudentName.value) return props.penaltyTypeName
  return ''
})
</script>

<template>
  <ResponsiveEventCardLayout>
    <template #icon>
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-bg-subtle"
      >
        <AlertTriangle class="h-4 w-4 text-warning" />
      </div>
    </template>

    <template #title>
      <StudentEventTitle
        :fallback-label="props.penaltyTypeName"
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
      <p class="shrink-0 text-xs text-muted-foreground sm:text-right">
        {{ formatDate(displayedDate) }}
      </p>
    </template>

    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </ResponsiveEventCardLayout>
</template>
