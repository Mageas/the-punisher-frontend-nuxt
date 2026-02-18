<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

interface Props {
  page: number
  itemsPerPage: number
  total: number
  loading?: boolean
  siblingCount?: number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  siblingCount: 1,
})

const emit = defineEmits<{
  'update:page': [value: number]
}>()
</script>

<template>
  <div :class="['flex justify-center', props.class]">
    <Pagination
      :page="props.page"
      :items-per-page="props.itemsPerPage"
      :total="props.total"
      :sibling-count="props.siblingCount"
      show-edges
      :disabled="props.loading"
      class="mx-0 w-full justify-center"
      @update:page="(value) => emit('update:page', value)"
    >
      <PaginationContent v-slot="slotProps">
        <PaginationPrevious>
          <span class="hidden sm:block">Précédent</span>
        </PaginationPrevious>
        <template v-for="(item, index) in slotProps?.items ?? []" :key="index">
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === props.page"
          >
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-else :index="index" />
        </template>
        <PaginationNext>
          <span class="hidden sm:block">Suivant</span>
        </PaginationNext>
      </PaginationContent>
    </Pagination>
  </div>
</template>
