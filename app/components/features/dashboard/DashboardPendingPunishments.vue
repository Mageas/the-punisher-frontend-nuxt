<script setup lang="ts">
import type { DashboardPunishment } from '~/types/api'

const props = defineProps<{
  punishments: DashboardPunishment[]
  resolveFn: (id: string) => Promise<void>
}>()

const emit = defineEmits<{
  resolved: []
}>()

const { t } = useI18n()
</script>

<template>
  <PendingPunishmentsSection
    :punishments="props.punishments"
    :title="t('dashboard.pendingPunishments')"
    :empty-label="t('punishments.noPunishments')"
    :show-count="true"
    compact
    :resolve-fn="props.resolveFn"
    @resolved="emit('resolved')"
  />
</template>
