<script setup lang="ts">
interface PendingPunishment {
  id: string
  punishment_type_name: string
  automated: boolean
  triggering_rule_id?: string | null
  triggering_rule_name?: string | null
  due_at?: string | null
  student_first_name?: string
  student_last_name?: string
}

const props = defineProps<{
  punishments: PendingPunishment[]
  title?: string
  emptyLabel?: string
  showCount?: boolean
  countOverride?: number
  badgeText?: string
  badgeHelpText?: string
  compact?: boolean
  resolveFn?: (id: string) => Promise<void>
  page?: number
  totalPages?: number
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  resolved: []
  'update:page': [value: number]
}>()
</script>

<template>
  <PendingPunishmentsSection
    v-bind="props"
    @resolved="emit('resolved')"
    @update:page="emit('update:page', $event)"
  />
</template>
