<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { SectionFilterOption } from '~/types/ui'

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
    filterOptions?: SectionFilterOption[]
    filterValue?: string
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
    filterOptions: undefined,
    filterValue: undefined,
  },
)

const emit = defineEmits<{
  'update:page': [value: number]
  'update:filterValue': [value: string]
}>()

const hasBadge = computed(
  () => props.badgeText !== undefined && props.badgeText !== null && props.badgeText !== '',
)
const displayedBadgeText = computed<string | number>(() =>
  hasBadge.value ? (props.badgeText as string | number) : '',
)

const hasFilter = computed(
  () => Array.isArray(props.filterOptions) && props.filterOptions.length > 1,
)
const filterOpen = ref(false)

const displayedTitle = computed(() => {
  if (!hasFilter.value || !props.filterValue) return props.title
  const selected = props.filterOptions!.find((o) => o.value === props.filterValue)
  return selected?.label ?? props.title
})

function selectFilter(value: string) {
  emit('update:filterValue', value)
  filterOpen.value = false
}
</script>

<template>
  <div
    class="mb-4 flex flex-wrap items-center justify-between gap-2"
    data-testid="section-header-row"
  >
    <div class="flex min-w-0 items-center gap-3">
      <!-- Filterable title with Popover -->
      <Popover v-if="hasFilter" v-model:open="filterOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-0.5 -ml-1.5 text-lg font-semibold transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="section-filter-trigger"
          >
            {{ displayedTitle }}
            <ChevronDown
              class="h-4 w-4 text-muted-foreground transition-transform duration-200"
              :class="{ 'rotate-180': filterOpen }"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" :side-offset="6" class="w-auto min-w-48 p-1.5">
          <ul role="listbox" class="space-y-0.5">
            <li
              v-for="option in filterOptions"
              :key="option.value"
              role="option"
              :aria-selected="option.value === filterValue"
              tabindex="0"
              class="cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              :class="{
                'bg-accent text-accent-foreground': option.value === filterValue,
              }"
              @click="selectFilter(option.value)"
              @keydown.enter.prevent="selectFilter(option.value)"
              @keydown.space.prevent="selectFilter(option.value)"
            >
              {{ option.label }}
            </li>
          </ul>
        </PopoverContent>
      </Popover>

      <!-- Static title (no filter) -->
      <h2 v-else class="text-lg font-semibold">
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
