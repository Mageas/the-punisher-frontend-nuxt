<script setup lang="ts">
interface AvailableBonus {
  id: string
  bonus_type_name: string
  points: number
  created_at: string
}

const props = defineProps<{
  bonuses: AvailableBonus[]
  title?: string
  emptyLabel?: string
  badgeText?: string
  badgeHelpText?: string
  useFn?: (id: string) => Promise<void>
  page?: number
  totalPages?: number
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  used: []
  'update:page': [value: number]
}>()
</script>

<template>
  <AvailableBonusesSection
    :bonuses="props.bonuses"
    :title="props.title"
    :empty-label="props.emptyLabel"
    :badge-text="props.badgeText"
    :badge-help-text="props.badgeHelpText"
    :use-fn="props.useFn"
    :page="props.page"
    :total-pages="props.totalPages"
    :loading="props.loading"
    :disabled="props.disabled"
    @used="emit('used')"
    @update:page="emit('update:page', $event)"
  />
</template>
