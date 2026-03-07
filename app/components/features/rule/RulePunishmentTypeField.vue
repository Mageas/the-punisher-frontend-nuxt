<script setup lang="ts">
interface IdNameOption {
  id: string
  name: string
}

const props = withDefaults(
  defineProps<{
    selectedName?: string
  }>(),
  {
    selectedName: undefined,
  },
)

const emit = defineEmits<{
  selectedOption: [option: IdNameOption | null]
}>()

const { t } = useI18n()
</script>

<template>
  <FormField v-slot="{ value, handleChange }" name="resulting_punishment_type_id">
    <FormItem>
      <FormLabel>{{ t('modals.rule.punishmentType') }}</FormLabel>
      <FormControl>
        <PunishmentTypeSelect
          :model-value="value"
          :selected-name="props.selectedName"
          :placeholder="t('common.placeholders.selectType')"
          :empty-text="t('common.empty.noTypeFound')"
          @update:model-value="handleChange"
          @selected-option="emit('selectedOption', $event)"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
