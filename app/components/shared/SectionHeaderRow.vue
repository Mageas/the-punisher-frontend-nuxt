<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    page?: number
    totalPages?: number
    loading?: boolean
    disabled?: boolean
    showPagination?: boolean
    badgeText?: string | number | null
    badgeHelpText?: string
    badgeClass?: HTMLAttributes['class']
  }>(),
  {
    page: 1,
    totalPages: 1,
    loading: false,
    disabled: false,
    showPagination: true,
    badgeText: undefined,
    badgeHelpText: undefined,
    badgeClass: undefined,
  },
)

const emit = defineEmits<{
  'update:page': [value: number]
}>()

const hasBadge = computed(
  () => props.badgeText !== undefined && props.badgeText !== null && props.badgeText !== '',
)
const displayedBadgeText = computed<string | number>(() =>
  hasBadge.value ? (props.badgeText as string | number) : '',
)
</script>

<template>
  <div
    class="mb-4 flex flex-wrap items-center justify-between gap-2"
    data-testid="section-header-row"
  >
    <div class="flex min-w-0 items-center gap-3">
      <h2 class="text-lg font-semibold">
        {{ props.title }}
      </h2>
      <SectionHeaderPagination
        v-if="props.showPagination"
        :page="props.page"
        :total-pages="props.totalPages"
        :loading="props.loading"
        :disabled="props.disabled"
        @update:page="emit('update:page', $event)"
      />
    </div>

    <KpiInfoBadge
      v-if="hasBadge"
      :text="displayedBadgeText"
      :help-text="props.badgeHelpText"
      :badge-class="props.badgeClass"
    />
  </div>
</template>
