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
  useFn?: (id: string) => Promise<void>
}>()

const emit = defineEmits<{
  used: []
}>()
</script>

<template>
  <AvailableBonusesSection
    :bonuses="props.bonuses"
    :title="props.title"
    :empty-label="props.emptyLabel"
    :use-fn="props.useFn"
    @used="emit('used')"
  />
</template>
