<script setup lang="ts">
import type { Penalty } from '~/types/api'

const props = defineProps<{
  penalties: Penalty[]
  title?: string
  emptyLabel?: string
  page?: number
  totalPages?: number
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:page': [value: number]
}>()

const { t } = useI18n()

const sectionTitle = computed(() => props.title ?? t('studentProfile.penalties'))
const sectionEmptyLabel = computed(() => props.emptyLabel ?? t('studentProfile.empty.penalties'))
const currentPage = computed(() => props.page ?? 1)
const currentTotalPages = computed(() => props.totalPages ?? 1)
const paginationLoading = computed(() => props.loading ?? false)
const paginationDisabled = computed(() => props.disabled ?? false)
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-3">
        <h2 class="text-lg font-semibold">
          {{ sectionTitle }}
        </h2>
        <SectionHeaderPagination
          :page="currentPage"
          :total-pages="currentTotalPages"
          :loading="paginationLoading"
          :disabled="paginationDisabled"
          @update:page="emit('update:page', $event)"
        />
      </div>
    </div>

    <div
      v-if="penalties.length === 0"
      class="rounded-lg border border-border p-6 text-sm text-muted-foreground"
    >
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
