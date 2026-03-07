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

const sectionProps = computed(() => ({
  ...props,
  title: t('common.titles.pendingPunishments'),
  emptyLabel: t('common.empty.noPunishments'),
  showCount: true,
  compact: true,
}))
</script>

<template>
  <PendingPunishmentsSection v-bind="sectionProps" @resolved="emit('resolved')" />
</template>
