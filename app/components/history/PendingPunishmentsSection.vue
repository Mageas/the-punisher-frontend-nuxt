<script setup lang="ts">
interface PendingPunishment {
  id: string
  punishment_type_name: string
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
  compact?: boolean
  resolveFn?: (id: string) => Promise<void>
}>()

const emit = defineEmits<{
  resolved: []
}>()
</script>

<template>
  <PendingPunishmentsSection
    :punishments="props.punishments"
    :title="props.title"
    :empty-label="props.emptyLabel"
    :show-count="props.showCount"
    :compact="props.compact"
    :resolve-fn="props.resolveFn"
    @resolved="emit('resolved')"
  />
</template>
