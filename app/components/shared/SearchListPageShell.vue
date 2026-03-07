<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    title: string
    createLabel: string
    activeFilterCount?: number
    countLabel?: string
    itemsCount: number
    emptyMessage: string
    page: number
    itemsPerPage: number
    total: number
    loading?: boolean
    showPagination?: boolean
  }>(),
  {
    activeFilterCount: 0,
    countLabel: undefined,
    loading: false,
    showPagination: undefined,
  },
)

const emit = defineEmits<{
  create: []
  reset: []
  'update:page': [value: number]
}>()

const shouldShowList = computed(() => props.itemsCount > 0 || props.loading)
const shouldShowPagination = computed(() => props.showPagination ?? props.total > 0)
</script>

<template>
  <div>
    <PageHeaderBar align="center">
      <template #left>
        <PageTitleWithCount :title="props.title" :count-label="props.countLabel" />
      </template>

      <template #actions>
        <Button class="w-full cursor-pointer justify-center md:w-auto" @click="emit('create')">
          <Plus class="h-4 w-4" />
          {{ props.createLabel }}
        </Button>
      </template>
    </PageHeaderBar>

    <FilterBar :active-filter-count="props.activeFilterCount" @reset="emit('reset')">
      <slot name="filters" />
    </FilterBar>

    <ListEmptyState
      :items-count="props.itemsCount"
      :loading="props.loading"
      :message="props.emptyMessage"
    />

    <div v-if="shouldShowList">
      <slot />
    </div>

    <CustomPagination
      v-if="shouldShowPagination"
      class="mt-4"
      :page="props.page"
      :items-per-page="props.itemsPerPage"
      :total="props.total"
      :loading="props.loading"
      @update:page="emit('update:page', $event)"
    />
  </div>
</template>
