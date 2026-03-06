<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { formatDate } from '~/lib/utils'

const props = defineProps<{
  penaltyTypeName: string
  occurredAt?: string
  createdAt: string
  studentId?: string
  studentFirstName?: string
  studentLastName?: string
}>()

const hasStudentName = computed(() => Boolean(props.studentFirstName && props.studentLastName))
const displayedDate = computed(() => props.occurredAt ?? props.createdAt)
</script>

<template>
  <div class="flex items-center gap-4 rounded-lg border border-border p-4">
    <div
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-bg-subtle"
    >
      <AlertTriangle class="h-4 w-4 text-warning" />
    </div>

    <div class="min-w-0 flex-1">
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
        <span v-else>{{ penaltyTypeName }}</span>
      </p>
      <p v-if="hasStudentName" class="mt-0.5 text-xs text-muted-foreground">
        {{ penaltyTypeName }}
      </p>
    </div>

    <span class="text-xs text-muted-foreground shrink-0">
      {{ formatDate(displayedDate) }}
    </span>

    <div v-if="$slots.actions" class="flex items-center gap-1">
      <slot name="actions" />
    </div>
  </div>
</template>
