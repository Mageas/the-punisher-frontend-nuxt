<script setup lang="ts">
import { Gavel } from 'lucide-vue-next'
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
  <div
    class="flex flex-wrap items-center rounded-lg border border-border sm:flex-nowrap"
    :class="[{ 'opacity-60': resolvedAt }, compact ? 'gap-3 p-3' : 'gap-4 p-4']"
  >
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-400/10">
      <Gavel class="h-4 w-4 text-red-400" />
    </div>

    <!-- Content -->
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
        <Badge
          v-if="isAutomated"
          variant="outline"
          class="text-xs text-blue-400 border-blue-400/30"
        >
          {{ t('common.auto') }}
        </Badge>
      </div>
      <p class="mt-0.5 text-xs text-muted-foreground">
        {{ subtitle }}
      </p>
    </div>

    <!-- Status -->
    <div class="text-left sm:text-right">
      <Badge v-if="!resolvedAt" variant="outline" class="text-amber-400 border-amber-400/30">
        {{ t('punishments.pending') }}
      </Badge>
      <Badge v-else variant="outline" class="text-green-400 border-green-400/30">
        {{ t('punishments.resolved') }}
      </Badge>
      <p v-if="!resolvedAt && dueAt" class="mt-1 text-xs text-muted-foreground">
        {{ t('common.dueAt', { date: formatDate(dueAt) }) }}
      </p>
      <p v-else-if="resolvedAt" class="mt-1 text-xs text-muted-foreground">
        {{ t('punishments.resolvedAt', { date: formatDate(resolvedAt) }) }}
      </p>
    </div>

    <!-- Actions slot -->
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1">
      <slot name="actions" />
    </div>
  </div>
</template>
