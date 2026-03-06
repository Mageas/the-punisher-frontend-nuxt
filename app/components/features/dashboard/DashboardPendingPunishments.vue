<script setup lang="ts">
import type { DashboardPunishment } from '~/types/api'

const props = defineProps<{
  punishments: DashboardPunishment[]
  resolveFn: (id: string) => Promise<void>
  countOverride?: number
  badgeText?: string
  badgeHelpText?: string
}>()

const emit = defineEmits<{
  resolved: []
}>()

const { t } = useI18n()
</script>

<template>
  <PendingPunishmentsSection
    :punishments="props.punishments"
    :title="t('common.titles.pendingPunishments')"
    :empty-label="t('common.empty.noPunishments')"
    :show-count="true"
    :count-override="props.countOverride"
    :badge-text="props.badgeText"
    :badge-help-text="props.badgeHelpText"
    compact
    :resolve-fn="props.resolveFn"
    @resolved="emit('resolved')"
  />
</template>
