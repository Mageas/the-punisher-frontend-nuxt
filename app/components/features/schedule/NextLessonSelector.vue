<script setup lang="ts">
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { Check, Info } from 'lucide-vue-next'
import ChoicePillsList from '~/components/shared/ChoicePillsList.vue'
import CollapsedChoiceSummary from '~/components/shared/CollapsedChoiceSummary.vue'
import ExpandableChoicePanel from '~/components/shared/ExpandableChoicePanel.vue'
import ExpandableChoicePanelHeader from '~/components/shared/ExpandableChoicePanelHeader.vue'
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
  <ExpandableChoicePanel :expanded="shouldShowExpanded" tone="muted">
    <template #expanded>
      <ExpandableChoicePanelHeader
        :title="props.title"
        :hint="props.hint"
        :hide-label="t('common.actions.hide')"
        @hide="open = false"
      >
        <template #icon>
          <Info class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </template>
      </ExpandableChoicePanelHeader>

      <p v-if="props.loading" class="text-sm text-muted-foreground">
        {{ t('modals.punishment.nextLessonsLoading') }}
      </p>

      <ChoicePillsList v-else-if="props.lessons.length > 0">
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
      </ChoicePillsList>

      <p v-else class="text-sm text-muted-foreground">
        {{ props.emptyText }}
      </p>
    </template>

    <template #collapsed>
      <CollapsedChoiceSummary
        :title="t('common.actions.viewNextLessons')"
        :subtitle="selectedLessonLabel"
        @click="open = true"
      >
        <template #icon>
          <Info class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </template>
      </CollapsedChoiceSummary>
    </template>
  </ExpandableChoicePanel>
</template>
