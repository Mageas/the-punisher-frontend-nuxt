<script setup lang="ts">
import { Gavel, Scale } from 'lucide-vue-next'
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
const studentFullName = computed(() => {
  if (!hasStudentName.value) return ''
  return `${props.studentFirstName} ${props.studentLastName}`
})
const isAutomated = computed(() => props.automated === true)
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
</script>

<template>
  <div
    class="rounded-lg border border-border"
    :class="[{ 'opacity-60': resolvedAt }, compact ? 'p-3' : 'p-4']"
  >
    <!-- Mobile: vertical layout -->
    <div class="flex items-start gap-3 sm:hidden">
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-bg-subtle"
      >
        <Gavel class="h-4 w-4 text-danger" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 min-w-0">
          <p class="text-sm font-medium min-w-0 truncate">
            <NuxtLink
              v-if="hasStudentName && props.studentId"
              :to="`/students/${props.studentId}`"
              class="transition-colors hover:text-primary hover:underline underline-offset-4"
            >
              {{ studentFullName }}
            </NuxtLink>
            <span v-else-if="hasStudentName">
              {{ studentFullName }}
            </span>
            <span v-else>{{ punishmentTypeName }}</span>
          </p>
        </div>
        <p v-if="secondaryLine" class="mt-0.5 text-xs text-muted-foreground">
          {{ secondaryLine }}
        </p>
        <p v-if="isAutomated" class="mt-1 inline-flex items-center gap-1.5 text-xs text-info">
          <Scale class="h-3 w-3 shrink-0" />
          <NuxtLink
            v-if="hasRuleLink"
            :to="rulesLink"
            class="truncate transition-colors hover:text-primary hover:underline underline-offset-4"
          >
            {{ automatedLabel }}
          </NuxtLink>
          <span v-else class="truncate">{{ automatedLabel }}</span>
        </p>
        <div class="mt-2 flex items-center justify-between">
          <div>
            <Badge v-if="!resolvedAt" variant="outline" class="text-warning border-warning-border">
              {{ t('common.states.pending') }}
            </Badge>
            <Badge v-else variant="outline" class="text-success border-success-border">
              {{ t('common.states.resolved') }}
            </Badge>
            <p v-if="!resolvedAt && dueAt" class="mt-1 text-xs text-muted-foreground">
              {{ t('common.dueAt', { date: formatDate(dueAt) }) }}
            </p>
            <p v-else-if="resolvedAt" class="mt-1 text-xs text-muted-foreground">
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
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-bg-subtle"
      >
        <Gavel class="h-4 w-4 text-danger" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 min-w-0">
          <p class="text-sm font-medium min-w-0 truncate">
            <NuxtLink
              v-if="hasStudentName && props.studentId"
              :to="`/students/${props.studentId}`"
              class="transition-colors hover:text-primary hover:underline underline-offset-4"
            >
              {{ studentFullName }}
            </NuxtLink>
            <span v-else-if="hasStudentName">
              {{ studentFullName }}
            </span>
            <span v-else>{{ punishmentTypeName }}</span>
          </p>
        </div>
        <p v-if="secondaryLine" class="mt-0.5 flex items-center text-xs text-muted-foreground">
          <span>{{ secondaryLine }}</span>
          <template v-if="isAutomated">
            <span class="mx-1.5">·</span>
            <span class="inline-flex items-center gap-1 text-info">
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
        </p>
      </div>
      <div class="text-right">
        <Badge v-if="!resolvedAt" variant="outline" class="text-warning border-warning-border">
          {{ t('common.states.pending') }}
        </Badge>
        <Badge v-else variant="outline" class="text-success border-success-border">
          {{ t('common.states.resolved') }}
        </Badge>
        <p v-if="!resolvedAt && dueAt" class="mt-1 text-xs text-muted-foreground">
          {{ t('common.dueAt', { date: formatDate(dueAt) }) }}
        </p>
        <p v-else-if="resolvedAt" class="mt-1 text-xs text-muted-foreground">
          {{ t('punishments.resolvedAt', { date: formatDate(resolvedAt) }) }}
        </p>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
