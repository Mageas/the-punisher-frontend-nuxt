<script setup lang="ts">
import { ArrowRight, Pencil, Trash2 } from 'lucide-vue-next'
import type { RuleDueAtMode, RuleMode } from '~/types/api'

const props = withDefaults(
  defineProps<{
    name: string
    penaltyTypeName: string
    punishmentTypeName: string
    threshold: number
    dueAtMode: RuleDueAtMode
    dueAtAfterDays: number | null
    dueAtAfterLessons: number | null
    mode: RuleMode
    isActive: boolean
    toggling?: boolean
  }>(),
  {
    toggling: false,
  },
)

const emit = defineEmits<{
  toggleActive: [nextIsActive: boolean]
  view: []
  edit: []
  delete: []
}>()

const { t } = useI18n()

const modeLabel = computed(() => t(`rules.modes.${props.mode}`))
const dueLabel = computed(() => {
  if (props.dueAtMode === 'next_lessons') {
    return t('rules.dueAfterLessons', props.dueAtAfterLessons ?? 0)
  }

  return t('rules.dueAfterDays', props.dueAtAfterDays ?? 0)
})

const onUpdateModelValue = (value: boolean) => {
  emit('toggleActive', value)
}
</script>

<template>
  <div
    class="flex flex-wrap items-start gap-3 rounded-lg border border-border p-4 sm:flex-nowrap sm:items-center sm:gap-4"
    :class="{ 'opacity-60': !props.isActive }"
  >
    <Switch
      :model-value="props.isActive"
      :disabled="props.toggling"
      class="cursor-pointer"
      @update:model-value="onUpdateModelValue"
    />

    <button
      type="button"
      class="min-w-0 flex-1 rounded-md text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      :title="t('common.actions.view')"
      :aria-label="t('common.actions.view')"
      @click="emit('view')"
    >
      <p class="text-sm font-semibold truncate">
        {{ props.name }}
      </p>

      <div class="mt-1 flex flex-wrap items-center gap-2">
        <span class="text-xs text-muted-foreground">{{ props.penaltyTypeName }}</span>
        <ArrowRight class="h-3.5 w-3.5 text-muted-foreground" />
        <span class="text-xs text-muted-foreground">{{ props.punishmentTypeName }}</span>
      </div>

      <div class="mt-1 flex flex-wrap items-center gap-2">
        <Badge variant="outline" class="text-xs text-muted-foreground">
          {{ modeLabel }}
        </Badge>
        <span class="text-xs text-muted-foreground">
          {{ t('rules.threshold', { count: props.threshold }) }}
        </span>
        <span class="text-xs text-muted-foreground">
          {{ dueLabel }}
        </span>
      </div>
    </button>

    <div class="ml-auto flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        class="cursor-pointer text-muted-foreground hover:text-foreground"
        :title="t('common.actions.edit')"
        :aria-label="t('common.actions.edit')"
        @click="emit('edit')"
      >
        <Pencil class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="cursor-pointer text-muted-foreground hover:text-foreground"
        :title="t('common.actions.delete')"
        :aria-label="t('common.actions.delete')"
        @click="emit('delete')"
      >
        <Trash2 class="h-4 w-4 text-danger" />
      </Button>
    </div>
  </div>
</template>
