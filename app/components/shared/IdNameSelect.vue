<script setup lang="ts">
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { IdNameOptionsFetcher } from '~/composables/useLazyIdNameOptions'

defineOptions({
  inheritAttrs: false,
})

interface IdNameOption {
  id: string
  name: string
}

const NONE_OPTION_VALUE = '__none_option__'

const props = withDefaults(
  defineProps<{
    options?: readonly IdNameOption[]
    placeholder: string
    searchPlaceholder: string
    emptyText: string
    fullWidth?: boolean
    disabled?: boolean
    keepFocusOnSelect?: boolean
    noneOptionLabel?: string
    noneValueLabel?: string
    noneOptionValue?: string
    fetchOptions?: IdNameOptionsFetcher
    optionsScopeKey?: string | number | boolean | null
    searchDebounceMs?: number
    selectedLabel?: string
  }>(),
  {
    options: () => [],
    fullWidth: true,
    disabled: false,
    keepFocusOnSelect: false,
    noneOptionValue: NONE_OPTION_VALUE,
    noneOptionLabel: undefined,
    noneValueLabel: undefined,
    fetchOptions: undefined,
    optionsScopeKey: null,
    searchDebounceMs: 300,
    selectedLabel: undefined,
  },
)

const modelValue = defineModel<string>({ default: '' })
const emit = defineEmits<{
  selectedOption: [option: IdNameOption | null]
}>()
const attrs = useAttrs()

const open = ref(false)
const searchQuery = ref('')
const { t } = useI18n()

const lazyOptions = useLazyIdNameOptions({
  open,
  search: searchQuery,
  staticOptions: computed(() => props.options),
  fetchOptions: props.fetchOptions,
  optionsScopeKey: computed(() => props.optionsScopeKey),
  searchDebounceMs: props.searchDebounceMs,
})

const selectedOption = computed<IdNameOption | null>(() => {
  if (!modelValue.value) return null

  const knownOption = lazyOptions.getKnownOption(modelValue.value)
  if (knownOption) return knownOption

  if (props.selectedLabel) {
    return {
      id: modelValue.value,
      name: props.selectedLabel,
    }
  }

  return null
})

const selectOptions = computed(() => {
  const options = lazyOptions.options.value
  if (!props.noneOptionLabel) return options

  return [{ id: props.noneOptionValue, name: props.noneOptionLabel }, ...options]
})

const selectedLabel = computed(() => {
  if (!modelValue.value) return props.noneValueLabel ?? props.placeholder
  const found = selectedOption.value
  return found?.name ?? props.placeholder
})

function isSelected(optionId: string) {
  if (optionId === props.noneOptionValue) return !modelValue.value
  return modelValue.value === optionId
}

function resolveOptionById(optionId: string): IdNameOption | null {
  if (!optionId) return null

  const optionInSelectList = selectOptions.value.find((option) => option.id === optionId)
  if (optionInSelectList && optionInSelectList.id !== props.noneOptionValue) {
    return optionInSelectList
  }

  const knownOption = lazyOptions.getKnownOption(optionId)
  if (knownOption) return knownOption

  if (props.selectedLabel) {
    return { id: optionId, name: props.selectedLabel }
  }

  return null
}

function select(value: string) {
  const selectedValue = value === props.noneOptionValue ? '' : value
  modelValue.value = selectedValue
  emit('selectedOption', resolveOptionById(selectedValue))
  searchQuery.value = ''

  if (!props.keepFocusOnSelect) {
    open.value = false
  }
}

function onListScroll(event: Event) {
  if (!lazyOptions.isRemote.value || !lazyOptions.hasMore.value || lazyOptions.loadingMore.value) {
    return
  }

  if (lazyOptions.loadingInitial.value) return

  const target = event.target
  if (!(target instanceof HTMLElement)) return

  const thresholdPx = 12
  const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - thresholdPx
  if (!reachedBottom) return

  void lazyOptions.loadMore()
}

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) {
      searchQuery.value = ''
      return
    }

    searchQuery.value = ''
  },
)
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        v-bind="attrs"
        variant="outline"
        role="combobox"
        :disabled="props.disabled"
        :aria-expanded="open"
        :aria-label="selectedLabel"
        :class="
          cn(
            'max-w-full justify-between overflow-hidden font-normal cursor-pointer hover:bg-accent hover:text-accent-foreground',
            props.fullWidth ? 'w-full' : 'w-[200px]',
          )
        "
      >
        <span class="min-w-0 flex-1 truncate text-left" :title="selectedLabel">{{
          selectedLabel
        }}</span>
        <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      :class="
        cn(
          'max-w-[calc(100vw-2rem)] p-0',
          props.fullWidth ? 'w-[--reka-popover-trigger-width]' : 'w-[200px]',
        )
      "
      align="start"
    >
      <Command :disable-local-filter="lazyOptions.isRemote.value">
        <CommandInput v-model="searchQuery" :placeholder="searchPlaceholder" />
        <CommandList @scroll="onListScroll">
          <p
            v-if="lazyOptions.loadingInitial.value && selectOptions.length === 0"
            class="px-2 py-2 text-sm text-muted-foreground"
          >
            {{ t('common.loading') }}
          </p>
          <p v-else-if="selectOptions.length === 0" class="px-2 py-2 text-sm text-muted-foreground">
            {{ emptyText }}
          </p>
          <CommandEmpty v-if="selectOptions.length > 0">{{ emptyText }}</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="option in selectOptions"
              :key="option.id"
              :value="option.name"
              class="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              @select="select(option.id)"
            >
              <CheckIcon
                :class="cn('mr-2 h-4 w-4', isSelected(option.id) ? 'opacity-100' : 'opacity-0')"
              />
              <span class="min-w-0 flex-1 truncate" :title="option.name">{{ option.name }}</span>
            </CommandItem>
          </CommandGroup>
          <p v-if="lazyOptions.loadingMore.value" class="px-2 py-2 text-xs text-muted-foreground">
            {{ t('common.loading') }}
          </p>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
