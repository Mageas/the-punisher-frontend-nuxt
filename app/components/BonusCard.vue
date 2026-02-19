<script setup lang="ts">
import { formatDate } from '~/lib/utils'

const props = defineProps<{
  bonusTypeName: string
  points: number
  usedAt?: string | null
  createdAt?: string | null
  studentId?: string
  studentFirstName?: string
  studentLastName?: string
}>()

const { t } = useI18n()

const hasStudentName = computed(() => Boolean(props.studentFirstName && props.studentLastName))

function formatPoints(points: number): string {
  return `+${points}`
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4 sm:flex-nowrap"
    :class="{ 'opacity-60': usedAt }"
  >
    <!-- Points circle -->
    <div
      class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
      :class="usedAt ? 'bg-secondary text-muted-foreground' : 'bg-amber-400/10 text-amber-400'"
    >
      {{ formatPoints(points) }}
    </div>

    <!-- Content -->
    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium">
        <template v-if="hasStudentName">
          <NuxtLink
            v-if="props.studentId"
            :to="`/students/${props.studentId}`"
            class="transition-colors hover:text-primary hover:underline underline-offset-4"
          >
            {{ studentFirstName }} {{ studentLastName }}
          </NuxtLink>
          <template v-else>
            {{ studentFirstName }} {{ studentLastName }}
          </template>
        </template>
        <template v-else>
          {{ bonusTypeName }}
        </template>
      </p>
      <p class="mt-0.5 text-xs text-muted-foreground">
        <template v-if="hasStudentName">
          {{ bonusTypeName }}
          <template v-if="createdAt"> — {{ formatDate(createdAt) }}</template>
        </template>
        <template v-else-if="createdAt">
          {{ formatDate(createdAt) }}
        </template>
      </p>
    </div>

    <!-- Status -->
    <div class="text-left sm:text-right">
      <Badge
        variant="outline"
        :class="usedAt ? 'text-muted-foreground' : 'text-green-400 border-green-400/30'"
      >
        {{ usedAt ? t('common.used') : t('common.available') }}
      </Badge>
      <p v-if="usedAt" class="mt-1 text-xs text-muted-foreground">
        {{ t('bonuses.usedAt', { date: formatDate(usedAt) }) }}
      </p>
    </div>

    <!-- Actions slot -->
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1">
      <slot name="actions" />
    </div>
  </div>
</template>
