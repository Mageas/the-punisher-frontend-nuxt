<script setup lang="ts">
import type { Penalty } from '~/types/api'

const props = defineProps<{
  penalties: Penalty[]
  title?: string
  emptyLabel?: string
  badgeText?: string
  badgeHelpText?: string
  page?: number
  totalPages?: number
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:page': [value: number]
}>()

const { t } = useI18n()

const sectionTitle = computed(() => props.title ?? t('common.titles.penalties'))
const sectionEmptyLabel = computed(() => props.emptyLabel ?? t('studentProfile.empty.penalties'))
</script>

<template>
  <div>
    <SectionHeaderRow
      :title="sectionTitle"
      :page="props.page"
      :total-pages="props.totalPages"
      :loading="props.loading"
      :disabled="props.disabled"
      :badge-text="props.badgeText"
      :badge-help-text="props.badgeHelpText"
      badge-class="text-muted-foreground"
      @update:page="emit('update:page', $event)"
    />

    <SectionListBlock
      :is-empty="penalties.length === 0"
      :empty-label="sectionEmptyLabel"
      list-class="space-y-2"
    >
      <PenaltyCard
        v-for="penalty in penalties"
        :key="penalty.id"
        :penalty-type-name="penalty.penalty_type_name"
        :occurred-at="penalty.occurred_at ?? penalty.created_at"
        :created-at="penalty.created_at"
      />
    </SectionListBlock>
  </div>
</template>
