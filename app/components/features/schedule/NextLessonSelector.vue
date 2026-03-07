<script setup lang="ts">
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { Check, ChevronDown, Info } from 'lucide-vue-next'
import type { NextLesson } from '~/types/api'
import { getNextLessonSelectionKey } from '~/lib/punishment-next-lesson'

const props = withDefaults(
  defineProps<{
    lessons: readonly NextLesson[]
    selectedLessonKey?: string | null
    loading?: boolean
    title: string
    hint: string
    emptyText: string
  }>(),
  {
    selectedLessonKey: null,
    loading: false,
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  select: [lesson: NextLesson]
}>()

const { t } = useI18n()

const nextLessonDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const selectedLesson = computed(
  () =>
    props.lessons.find((lesson) => getNextLessonSelectionKey(lesson) === props.selectedLessonKey) ??
    null,
)

const selectedLessonLabel = computed(() => {
  if (!selectedLesson.value) return ''
  return `${formatNextLessonDate(selectedLesson.value.date)} ${formatLessonTime(selectedLesson.value.start_time)}`
})

const shouldShowExpanded = computed(() => open.value || props.loading || props.lessons.length === 0)

function formatNextLessonDate(date: string): string {
  if (!date) return date

  try {
    return nextLessonDateFormatter.format(parseDate(date).toDate(getLocalTimeZone()))
  } catch {
    return date
  }
}

function formatLessonTime(time: string): string {
  const [hours = '08', minutes = '00'] = time.split(':')
  return `${hours}:${minutes}`
}

function isSelected(lesson: NextLesson): boolean {
  return getNextLessonSelectionKey(lesson) === props.selectedLessonKey
}

function selectLesson(lesson: NextLesson) {
  emit('select', lesson)
  open.value = false
}
</script>

<template>
  <div class="rounded-lg border border-border/70 bg-muted/30">
    <div v-if="shouldShowExpanded" class="p-3.5 space-y-3">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-2.5">
          <Info class="size-4 mt-0.5 text-muted-foreground shrink-0" />
          <div class="space-y-1">
            <p class="text-sm font-medium text-foreground">
              {{ props.title }}
            </p>
            <p class="text-sm text-muted-foreground leading-snug">
              {{ props.hint }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          @click="open = false"
        >
          {{ t('common.actions.hide') }}
        </button>
      </div>

      <p v-if="props.loading" class="text-sm text-muted-foreground">
        {{ t('modals.punishment.nextLessonsLoading') }}
      </p>

      <div v-else-if="props.lessons.length > 0" class="flex flex-wrap gap-2">
        <button
          v-for="lesson in props.lessons"
          :key="getNextLessonSelectionKey(lesson)"
          data-testid="next-lesson-option"
          type="button"
          :class="[
            'inline-flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isSelected(lesson)
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-background hover:border-primary/50 hover:bg-primary-bg-subtle',
          ]"
          @click="selectLesson(lesson)"
        >
          <span class="inline-flex items-center gap-1.5 text-sm font-medium">
            <Check v-if="isSelected(lesson)" class="size-3.5" />
            {{ formatNextLessonDate(lesson.date) }}
          </span>
          <span
            :class="[
              'text-xs',
              isSelected(lesson) ? 'text-primary-foreground/80' : 'text-muted-foreground',
            ]"
          >
            {{ formatLessonTime(lesson.start_time) }} - {{ formatLessonTime(lesson.end_time) }}
          </span>
        </button>
      </div>

      <p v-else class="text-sm text-muted-foreground">
        {{ props.emptyText }}
      </p>
    </div>

    <button
      v-else
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      @click="open = true"
    >
      <div class="flex min-w-0 items-start gap-2.5">
        <Info class="size-4 mt-0.5 text-muted-foreground shrink-0" />
        <div class="min-w-0">
          <p class="text-sm font-medium text-foreground">
            {{ t('common.actions.viewNextLessons') }}
          </p>
          <p v-if="selectedLessonLabel" class="text-sm text-muted-foreground">
            {{ selectedLessonLabel }}
          </p>
        </div>
      </div>
      <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
    </button>
  </div>
</template>
