<script setup lang="ts">
import { AlertCircle, ChevronRight, Star } from 'lucide-vue-next'
import type { Student } from '~/types/api'
import { formatPoints } from '~/lib/utils'

const props = defineProps<{
  student: Student
}>()

const { t } = useI18n()
</script>

<template>
  <NuxtLink
    :to="`/students/${props.student.id}`"
    class="flex flex-wrap items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary-hover sm:flex-nowrap sm:items-center"
  >
    <StudentAvatar
      :first-name="props.student.first_name"
      :last-name="props.student.last_name"
      size="lg"
    />

    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium">
        {{ props.student.first_name }} {{ props.student.last_name }}
      </p>
      <div v-if="props.student.classrooms.length > 0" class="mt-1 flex flex-wrap gap-1.5">
        <Badge
          v-for="classroom in props.student.classrooms"
          :key="classroom.id"
          variant="outline"
          class="text-xs text-muted-foreground"
        >
          {{ classroom.name }}
        </Badge>
      </div>
      <p v-else class="mt-1 text-xs text-muted-foreground">
        {{ t('students.noClassroom') }}
      </p>
    </div>

    <div class="ml-auto flex items-center gap-5 text-sm">
      <div class="flex items-center gap-1.5 text-warning-foreground">
        <Star class="h-3.5 w-3.5" />
        <span class="font-medium">{{ formatPoints(props.student.available_bonus_points) }}</span>
      </div>

      <div class="flex items-center gap-1.5 text-danger-foreground">
        <AlertCircle class="h-3.5 w-3.5" />
        <span class="font-medium">{{ props.student.penalty_count }}</span>
      </div>

      <ChevronRight class="h-4 w-4 text-muted-foreground" />
    </div>
  </NuxtLink>
</template>
