<script setup lang="ts">
import { ArrowRight, Pencil, Trash2 } from 'lucide-vue-next'
import type { RuleMode } from '~/types/api'

const props = withDefaults(
  defineProps<{
    penaltyTypeName: string
    punishmentTypeName: string
    threshold: number
    dueAtAfterDays: number
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
  edit: []
  delete: []
}>()

const { t } = useI18n()

const modeLabel = computed(() => t(`rules.modes.${props.mode}`))

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

    <div class="min-w-0 flex-1">
      <div class="mb-1 flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium">{{ props.penaltyTypeName }}</span>
        <ArrowRight class="h-3.5 w-3.5 text-muted-foreground" />
        <span class="text-sm font-medium">{{ props.punishmentTypeName }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="outline" class="text-xs text-muted-foreground">
          {{ modeLabel }}
        </Badge>
        <span class="text-xs text-muted-foreground">
          {{ t('rules.threshold', { count: props.threshold }) }}
        </span>
        <span class="text-xs text-muted-foreground">
          {{ t('rules.dueAfterDays', props.dueAtAfterDays) }}
        </span>
      </div>
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        class="cursor-pointer text-muted-foreground hover:text-foreground"
        :title="t('rules.edit')"
        :aria-label="t('rules.edit')"
        @click="emit('edit')"
      >
        <Pencil class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="cursor-pointer text-muted-foreground hover:text-foreground"
        :title="t('modals.delete.confirm')"
        :aria-label="t('modals.delete.confirm')"
        @click="emit('delete')"
      >
        <Trash2 class="h-4 w-4 text-red-400" />
      </Button>
    </div>
  </div>
</template>
