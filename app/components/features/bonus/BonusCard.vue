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
  <div class="rounded-lg border border-border p-4" :class="{ 'opacity-60': usedAt }">
    <!-- Mobile: vertical layout -->
    <div class="flex items-start gap-3 sm:hidden">
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
        :class="usedAt ? 'bg-secondary text-muted-foreground' : 'bg-amber-400/10 text-amber-400'"
      >
        {{ formatPoints(points) }}
      </div>
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
            <template v-else> {{ studentFirstName }} {{ studentLastName }} </template>
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
        <div class="mt-2 flex items-center justify-between">
          <div>
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
          <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: horizontal layout -->
    <div class="hidden items-center gap-4 sm:flex">
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
        :class="usedAt ? 'bg-secondary text-muted-foreground' : 'bg-amber-400/10 text-amber-400'"
      >
        {{ formatPoints(points) }}
      </div>
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
            <template v-else> {{ studentFirstName }} {{ studentLastName }} </template>
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
      <div class="text-right">
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
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
