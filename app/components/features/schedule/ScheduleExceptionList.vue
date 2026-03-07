<script setup lang="ts">
import type { ScheduleException } from '~/types/api'

defineProps<{
  exceptions: ScheduleException[]
}>()

const emit = defineEmits<{
  delete: [id: string]
  select: [exception: ScheduleException]
}>()
</script>

<template>
  <div>
    <ScheduleExceptionEmptyState v-if="exceptions.length === 0" />

    <div v-else class="space-y-2">
      <ScheduleExceptionListItem
        v-for="exception in exceptions"
        :key="exception.id"
        :exception="exception"
        @select="emit('select', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
