<script setup lang="ts">
import type { RuleMode } from '~/types/api'

interface RuleModeOption {
  id: RuleMode
  name: string
}

const props = defineProps<{
  modeOptions: readonly RuleModeOption[]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <FormField v-slot="{ componentField }" name="threshold">
      <FormItem>
        <FormLabel>{{ t('common.labels.threshold') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="number" min="1" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ value, handleChange }" name="mode">
      <FormItem>
        <FormLabel>{{ t('modals.rule.triggerMode') }}</FormLabel>
        <FormControl>
          <FilterIdNameSelect
            :model-value="value"
            :options="props.modeOptions"
            :placeholder="t('modals.rule.triggerMode')"
            :search-placeholder="t('modals.rule.triggerMode')"
            :empty-text="t('common.empty.noTypeFound')"
            @update:model-value="handleChange"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
