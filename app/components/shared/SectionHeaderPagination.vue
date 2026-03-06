<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  page: number
  totalPages: number
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:page': [value: number]
}>()

const shouldDisplay = computed(() => props.totalPages > 1)
const previousDisabled = computed(() => props.disabled || props.loading || props.page <= 1)
const nextDisabled = computed(
  () => props.disabled || props.loading || props.page >= props.totalPages,
)

function emitPreviousPage() {
  if (previousDisabled.value) return
  emit('update:page', props.page - 1)
}

function emitNextPage() {
  if (nextDisabled.value) return
  emit('update:page', props.page + 1)
}
</script>

<template>
  <div
    v-if="shouldDisplay"
    class="inline-flex items-center gap-0.5 rounded-full bg-muted/50 p-0.5 text-sm"
    data-testid="section-header-pagination"
  >
    <button
      type="button"
      class="inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-background hover:shadow-sm disabled:pointer-events-none disabled:opacity-40"
      :disabled="previousDisabled"
      aria-label="Previous page"
      @click="emitPreviousPage"
    >
      <ChevronLeft class="h-3.5 w-3.5" />
    </button>

    <span
      class="min-w-[2.5rem] select-none text-center text-xs font-semibold tabular-nums text-foreground"
    >
      {{ page }}/{{ totalPages }}
    </span>

    <button
      type="button"
      class="inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-background hover:shadow-sm disabled:pointer-events-none disabled:opacity-40"
      :disabled="nextDisabled"
      aria-label="Next page"
      @click="emitNextPage"
    >
      <ChevronRight class="h-3.5 w-3.5" />
    </button>
  </div>
</template>
