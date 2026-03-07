<script setup lang="ts">
interface AvailableBonus {
  id: string
  bonus_type_name: string
  points: number
  occurred_at?: string
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
    v-bind="props"
    @used="emit('used')"
    @update:page="emit('update:page', $event)"
  />
</template>
