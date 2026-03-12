<script setup lang="ts">
import { CalendarRange, Landmark, Palmtree, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    open: boolean
    isEditing?: boolean
    hasCompleteSelection?: boolean
    startLabel: string
    endLabel?: string | null
    dayCount?: number
  }>(),
  {
    isEditing: false,
    hasCompleteSelection: false,
    endLabel: null,
    dayCount: 0,
  },
)

const emit = defineEmits<{
  close: []
  'save-vacation': []
  'save-holiday': []
}>()

const { t } = useI18n()

const selectionTitle = computed(() =>
  props.isEditing ? t('schedule.exceptions.editing') : t('schedule.exceptions.selectedRange'),
)

const borderClass = computed(() =>
  props.isEditing ? 'border-schedule-editing-border' : 'border-schedule-selecting-border',
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="props.open"
        class="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4 sm:px-4 sm:pb-6"
        data-testid="schedule-exception-selection-bar"
      >
        <div
          :class="borderClass"
          class="relative w-full max-w-2xl rounded-xl border-2 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sm:flex sm:items-center sm:gap-4 sm:px-5 sm:py-3.5"
        >
          <Button
            size="icon"
            variant="ghost"
            class="absolute right-2 top-2 h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground sm:static sm:order-last sm:shrink-0"
            data-testid="schedule-exception-selection-bar-close"
            @click="emit('close')"
          >
            <X class="h-3.5 w-3.5" />
            <span class="sr-only">{{ t('schedule.exceptions.cancelSelection') }}</span>
          </Button>

          <div class="mb-3 flex items-center gap-3 pr-8 sm:mb-0 sm:min-w-0 sm:flex-1 sm:pr-0">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <CalendarRange class="h-4.5 w-4.5" />
            </div>
            <div class="min-w-0">
              <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {{ selectionTitle }}
              </p>
              <p v-if="props.isEditing" class="mb-1 text-xs text-muted-foreground">
                {{ t('schedule.exceptions.editingHint') }}
              </p>
              <p class="text-sm font-medium leading-tight">
                {{ props.startLabel }}
                <template v-if="props.endLabel"> — {{ props.endLabel }} </template>
              </p>
              <p v-if="props.hasCompleteSelection" class="text-xs text-muted-foreground">
                {{ t('schedule.exceptions.dayCount', props.dayCount) }}
              </p>
            </div>
          </div>

          <div v-if="props.hasCompleteSelection" class="flex shrink-0 gap-2">
            <Button
              size="sm"
              class="flex-1 cursor-pointer gap-1.5 bg-schedule-vacation-button text-schedule-vacation-button-foreground hover:bg-schedule-vacation-button-hover sm:flex-none"
              data-testid="schedule-exception-save-vacation"
              @click="emit('save-vacation')"
            >
              <Palmtree class="h-3.5 w-3.5" />
              {{ t('schedule.exceptions.addAsVacation') }}
            </Button>
            <Button
              size="sm"
              variant="outline"
              class="flex-1 cursor-pointer gap-1.5 border-schedule-holiday-border text-schedule-holiday-text hover:bg-schedule-holiday-bg-hover sm:flex-none"
              data-testid="schedule-exception-save-holiday"
              @click="emit('save-holiday')"
            >
              <Landmark class="h-3.5 w-3.5" />
              {{ t('schedule.exceptions.addAsHoliday') }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
