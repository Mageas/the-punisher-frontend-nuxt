<script setup lang="ts">
import { ArrowRight, Pencil } from 'lucide-vue-next'
import { formatDateTime } from '~/lib/utils'
import type { Rule } from '~/types/api'

const props = withDefaults(
  defineProps<{
    rule: Rule | null
    loading?: boolean
    showEditAction?: boolean
  }>(),
  {
    loading: false,
    showEditAction: false,
  },
)

const emit = defineEmits<{
  edit: []
}>()

const open = defineModel<boolean>('open', { default: false })
const { t } = useI18n()

const modeLabel = computed(() => (props.rule ? t(`rules.modes.${props.rule.mode}`) : ''))
const dueModeLabel = computed(() =>
  props.rule ? t(`rules.dueModes.${props.rule.due_at_mode}`) : '',
)
const dueLabel = computed(() => {
  if (!props.rule) return ''

  if (props.rule.due_at_mode === 'next_lessons') {
    return t('rules.dueAfterLessons', props.rule.due_at_after_lessons ?? 0)
  }

  return t('rules.dueAfterDays', props.rule.due_at_after_days ?? 0)
})
const statusLabel = computed(() =>
  props.rule?.is_active ? t('rules.details.active') : t('rules.details.inactive'),
)
const statusVariant = computed(() => (props.rule?.is_active ? 'default' : 'secondary'))
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="min-w-0 overflow-x-hidden sm:max-w-lg">
      <DialogHeader class="space-y-2">
        <DialogTitle class="text-left">
          {{ props.rule?.name || t('common.titles.rules') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('rules.details.description') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="props.loading" class="py-8 text-sm text-muted-foreground">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="props.rule" class="space-y-4">
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <Badge :variant="statusVariant">
              {{ statusLabel }}
            </Badge>
            <Badge variant="outline">
              {{ modeLabel }}
            </Badge>
            <Badge variant="outline">
              {{ dueModeLabel }}
            </Badge>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span class="text-muted-foreground">{{ t('rules.details.triggerFlow') }}</span>
            <span class="font-medium">{{ props.rule.penalty_type_name }}</span>
            <ArrowRight class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">{{ props.rule.resulting_punishment_type_name }}</span>
          </div>
        </div>

        <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-border p-3">
            <dt class="text-xs uppercase tracking-wide text-muted-foreground">
              {{ t('rules.details.trigger') }}
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ props.rule.penalty_type_name }}
            </dd>
          </div>

          <div class="rounded-lg border border-border p-3">
            <dt class="text-xs uppercase tracking-wide text-muted-foreground">
              {{ t('rules.details.consequence') }}
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ props.rule.resulting_punishment_type_name }}
            </dd>
          </div>

          <div class="rounded-lg border border-border p-3">
            <dt class="text-xs uppercase tracking-wide text-muted-foreground">
              {{ t('common.labels.threshold') }}
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ t('rules.threshold', { count: props.rule.threshold }) }}
            </dd>
          </div>

          <div class="rounded-lg border border-border p-3">
            <dt class="text-xs uppercase tracking-wide text-muted-foreground">
              {{ t('common.labels.dueAt') }}
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ dueLabel }}
            </dd>
          </div>

          <div class="rounded-lg border border-border p-3">
            <dt class="text-xs uppercase tracking-wide text-muted-foreground">
              {{ t('rules.details.createdAt') }}
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ formatDateTime(props.rule.created_at) }}
            </dd>
          </div>

          <div class="rounded-lg border border-border p-3">
            <dt class="text-xs uppercase tracking-wide text-muted-foreground">
              {{ t('rules.details.updatedAt') }}
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ formatDateTime(props.rule.updated_at) }}
            </dd>
          </div>
        </dl>
      </div>

      <div v-else class="py-8 text-sm text-muted-foreground">
        {{ t('rules.details.empty') }}
      </div>

      <DialogFooter v-if="props.rule && !props.loading" class="mt-6">
        <Button
          v-if="props.showEditAction"
          type="button"
          class="cursor-pointer"
          @click="emit('edit')"
        >
          <Pencil class="h-4 w-4" />
          {{ t('common.actions.edit') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
