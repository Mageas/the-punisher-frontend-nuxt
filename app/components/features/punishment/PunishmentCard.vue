<script setup lang="ts">
import { CircleCheck, Gavel } from 'lucide-vue-next'
import { formatDate } from '~/lib/utils'

const props = defineProps<{
  punishmentTypeName: string
  automated: boolean
  triggeringRuleId?: string | null
  triggeringRuleName?: string | null
  dueAt?: string | null
  resolvedAt?: string | null
  studentId?: string
  studentFirstName?: string
  studentLastName?: string
  compact?: boolean
}>()

const { t } = useI18n()

const hasStudentName = computed(() => Boolean(props.studentFirstName && props.studentLastName))
const isAutomated = computed(() => props.automated === true)
const isResolved = computed(() => Boolean(props.resolvedAt))
const cardClass = computed(() => (isResolved.value ? 'border-status-used-border' : 'border-border'))
const punishmentIconContainerClass = computed(() =>
  isResolved.value ? 'bg-status-used-punishment' : 'bg-danger-bg-subtle',
)
const punishmentIconClass = computed(() =>
  isResolved.value ? 'text-status-used-icon' : 'text-danger',
)
const statusBadgeClass = computed(() =>
  isResolved.value
    ? 'text-status-used-icon border-status-used-border'
    : 'text-warning border-warning-border',
)

const subtitle = computed(() => {
  if (hasStudentName.value) {
    const parts = [props.punishmentTypeName]
    if (props.triggeringRuleName) {
      parts.push(props.triggeringRuleName)
    } else if (!isAutomated.value) {
      parts.push(t('punishments.manualPunishment'))
    }
    return parts.join(' — ')
  }

  if (props.triggeringRuleName) return props.triggeringRuleName
  return isAutomated.value ? t('common.auto') : t('punishments.manualPunishment')
})
</script>

<template>
  <div class="rounded-lg border" :class="[cardClass, compact ? 'p-3' : 'p-4']">
    <!-- Mobile: vertical layout -->
    <div class="flex items-start gap-3 sm:hidden">
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        :class="punishmentIconContainerClass"
      >
        <Gavel class="h-4 w-4" :class="punishmentIconClass" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium">
            <NuxtLink
              v-if="hasStudentName && props.studentId"
              :to="`/students/${props.studentId}`"
              class="transition-colors hover:text-primary hover:underline underline-offset-4"
            >
              {{ props.studentFirstName }} {{ props.studentLastName }}
            </NuxtLink>
            <span v-else-if="hasStudentName">
              {{ props.studentFirstName }} {{ props.studentLastName }}
            </span>
            <span v-else>{{ punishmentTypeName }}</span>
          </p>
          <Badge v-if="isAutomated" variant="outline" class="text-xs text-info border-info-border">
            {{ t('common.auto') }}
          </Badge>
        </div>
        <p class="mt-0.5 text-xs text-muted-foreground">
          {{ subtitle }}
        </p>
        <div class="mt-2 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span
                v-if="isResolved"
                class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-status-used-punishment text-status-used-icon"
              >
                <CircleCheck class="h-3.5 w-3.5" />
                <span class="sr-only">{{ t('punishments.resolved') }}</span>
              </span>
              <Badge variant="outline" :class="statusBadgeClass">
                {{ isResolved ? t('punishments.resolved') : t('punishments.pending') }}
              </Badge>
            </div>
            <p v-if="!isResolved && dueAt" class="mt-1 text-xs text-muted-foreground">
              {{ t('common.dueAt', { date: formatDate(dueAt) }) }}
            </p>
            <p v-else-if="isResolved" class="mt-1 text-xs text-muted-foreground">
              {{ t('punishments.resolvedAt', { date: formatDate(resolvedAt) }) }}
            </p>
          </div>
          <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: horizontal layout -->
    <div class="hidden items-center gap-4 sm:flex">
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        :class="punishmentIconContainerClass"
      >
        <Gavel class="h-4 w-4" :class="punishmentIconClass" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium">
            <NuxtLink
              v-if="hasStudentName && props.studentId"
              :to="`/students/${props.studentId}`"
              class="transition-colors hover:text-primary hover:underline underline-offset-4"
            >
              {{ props.studentFirstName }} {{ props.studentLastName }}
            </NuxtLink>
            <span v-else-if="hasStudentName">
              {{ props.studentFirstName }} {{ props.studentLastName }}
            </span>
            <span v-else>{{ punishmentTypeName }}</span>
          </p>
          <Badge v-if="isAutomated" variant="outline" class="text-xs text-info border-info-border">
            {{ t('common.auto') }}
          </Badge>
        </div>
        <p class="mt-0.5 text-xs text-muted-foreground">
          {{ subtitle }}
        </p>
      </div>
      <div class="text-right">
        <div class="flex items-center justify-end gap-2">
          <span
            v-if="isResolved"
            class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-status-used-punishment text-status-used-icon"
          >
            <CircleCheck class="h-3.5 w-3.5" />
            <span class="sr-only">{{ t('punishments.resolved') }}</span>
          </span>
          <Badge variant="outline" :class="statusBadgeClass">
            {{ isResolved ? t('punishments.resolved') : t('punishments.pending') }}
          </Badge>
        </div>
        <p v-if="!isResolved && dueAt" class="mt-1 text-xs text-muted-foreground">
          {{ t('common.dueAt', { date: formatDate(dueAt) }) }}
        </p>
        <p v-else-if="isResolved" class="mt-1 text-xs text-muted-foreground">
          {{ t('punishments.resolvedAt', { date: formatDate(resolvedAt) }) }}
        </p>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
