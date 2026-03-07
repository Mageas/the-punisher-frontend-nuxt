<script setup lang="ts">
import type { RuleDueAtMode } from '~/types/api'

interface RuleDueAtModeOption {
  id: RuleDueAtMode
  name: string
}

const props = defineProps<{
  dueAtMode: RuleDueAtMode
  dueAtModeOptions: readonly RuleDueAtModeOption[]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <FormField v-slot="{ value, handleChange }" name="due_at_mode">
      <FormItem>
        <FormLabel>{{ t('modals.rule.dueAtMode') }}</FormLabel>
        <FormControl>
          <FilterIdNameSelect
            :model-value="value"
            :options="props.dueAtModeOptions"
            :placeholder="t('modals.rule.dueAtMode')"
            :search-placeholder="t('modals.rule.dueAtMode')"
            :empty-text="t('common.empty.noTypeFound')"
            @update:model-value="handleChange"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField
      v-if="props.dueAtMode === 'days'"
      v-slot="{ componentField }"
      name="due_at_after_days"
    >
      <FormItem>
        <FormLabel>{{ t('modals.rule.dueAtAfterDays') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="number" min="0" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-else v-slot="{ componentField }" name="due_at_after_lessons">
      <FormItem>
        <FormLabel>{{ t('modals.rule.dueAtAfterLessons') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="number" min="1" max="5" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
