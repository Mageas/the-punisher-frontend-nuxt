<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { Search, X } from 'lucide-vue-next'
import { computed, nextTick, ref, watch } from 'vue'
import { cn } from '@/lib/utils'
const { t } = useI18n()

interface IdNameOption {
  id: string
  name: string
}

const props = withDefaults(
  defineProps<{
    options: readonly IdNameOption[]
    placeholder: string
    emptyText: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const modelValue = defineModel<string>({ default: '' })

const rootRef = ref<HTMLElement | null>(null)
const query = ref('')
const open = ref(false)
const highlightedIndex = ref(-1)
const isInputFocused = ref(false)

const selectedOption = computed(
  () => props.options.find((option) => option.id === modelValue.value) ?? null,
)

const filteredOptions = computed(() => {
  const normalizedQuery = query.value.trim().toLocaleLowerCase()
  if (!normalizedQuery) return props.options
  return props.options.filter((option) => option.name.toLocaleLowerCase().includes(normalizedQuery))
})
const showClearButton = computed(
  () => !props.disabled && (query.value.length > 0 || isInputFocused.value),
)

function syncQueryWithSelection() {
  query.value = selectedOption.value?.name ?? ''
}

function getInputElement() {
  return rootRef.value?.querySelector('input[data-slot="input"]') as HTMLInputElement | null
}

function focusInput() {
  const inputElement = getInputElement()
  if (!inputElement || document.activeElement === inputElement) return
  inputElement.focus()
}

function openDropdown() {
  if (props.disabled) return
  open.value = true
  highlightedIndex.value = filteredOptions.value.length > 0 ? 0 : -1
  nextTick(() => {
    if (!open.value) return
    focusInput()
  })
}

function closeDropdown() {
  open.value = false
  highlightedIndex.value = -1
  syncQueryWithSelection()
}

function blurInput() {
  const inputElement = getInputElement()
  inputElement?.blur()
  isInputFocused.value = false
}

function selectOption(option: IdNameOption) {
  modelValue.value = option.id
  query.value = option.name
  open.value = false
  highlightedIndex.value = -1
  blurInput()
}

function handleInput() {
  if (modelValue.value && selectedOption.value?.name !== query.value) {
    modelValue.value = ''
  }
  openDropdown()
}

function clearInput() {
  query.value = ''
  modelValue.value = ''
  closeDropdown()
  blurInput()
}

function handleFocus() {
  isInputFocused.value = true
  openDropdown()
}

function handleBlur() {
  isInputFocused.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDropdown()
    return
  }

  if (!open.value && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    openDropdown()
    event.preventDefault()
    return
  }

  if (!open.value) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (filteredOptions.value.length === 0) return
    highlightedIndex.value =
      (highlightedIndex.value + 1 + filteredOptions.value.length) % filteredOptions.value.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (filteredOptions.value.length === 0) return
    highlightedIndex.value =
      (highlightedIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
    return
  }

  if (event.key === 'Enter' && highlightedIndex.value >= 0) {
    event.preventDefault()
    const option = filteredOptions.value[highlightedIndex.value]
    if (option) selectOption(option)
  }
}

onClickOutside(rootRef, () => {
  if (!open.value) return
  closeDropdown()
})

watch(
  () => modelValue.value,
  () => {
    if (open.value) return
    syncQueryWithSelection()
  },
  { immediate: true },
)

watch(
  () => props.options,
  () => {
    if (modelValue.value && !selectedOption.value) {
      modelValue.value = ''
    }

    if (!open.value) {
      syncQueryWithSelection()
    }
  },
  { deep: true },
)

watch(filteredOptions, (options) => {
  if (!open.value || options.length === 0) {
    highlightedIndex.value = -1
    return
  }

  if (highlightedIndex.value < 0 || highlightedIndex.value >= options.length) {
    highlightedIndex.value = 0
  }
})
</script>

<template>
  <div ref="rootRef" class="relative">
    <Search
      class="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
    />
    <Input
      v-model="query"
      :placeholder="placeholder"
      class="pl-9 pr-9"
      autocomplete="off"
      :disabled="disabled"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
      @keydown="handleKeydown"
    />
    <button
      v-if="showClearButton"
      type="button"
      class="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
      :aria-label="t('ui.clearInput')"
      @mousedown.prevent
      @click="clearInput"
    >
      <X class="h-4 w-4" />
    </button>

    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-md"
    >
      <div v-if="filteredOptions.length > 0" class="max-h-56 overflow-y-auto">
        <button
          v-for="(option, index) in filteredOptions"
          :key="option.id"
          type="button"
          :class="
            cn(
              'w-full rounded-sm px-2 py-1.5 text-left text-sm cursor-pointer',
              index === highlightedIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/70',
            )
          "
          @mousedown.prevent="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          {{ option.name }}
        </button>
      </div>

      <p v-else class="px-2 py-2 text-sm text-muted-foreground">
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>
