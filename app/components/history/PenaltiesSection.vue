<script setup lang="ts">
import type { Penalty } from '~/types/api'

const props = defineProps<{
  penalties: Penalty[]
  title?: string
  emptyLabel?: string
}>()

const { t } = useI18n()

const sectionTitle = computed(() => props.title ?? t('studentProfile.penalties'))
const sectionEmptyLabel = computed(() => props.emptyLabel ?? t('studentProfile.empty.penalties'))
</script>

<template>
  <div>
    <h2 class="mb-4 text-lg font-semibold">
      {{ sectionTitle }}
    </h2>

    <div v-if="penalties.length === 0" class="rounded-lg border border-border p-6 text-sm text-muted-foreground">
      {{ sectionEmptyLabel }}
    </div>

    <div v-else class="space-y-2">
      <PenaltyCard
        v-for="penalty in penalties"
        :key="penalty.id"
        :penalty-type-name="penalty.penalty_type_name"
        :created-at="penalty.created_at"
      />
    </div>
  </div>
</template>
