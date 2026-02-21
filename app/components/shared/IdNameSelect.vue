<script setup lang="ts">
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
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

interface IdNameOption {
  id: string
  name: string
}

const NONE_OPTION_VALUE = '__none_option__'

const props = withDefaults(
  defineProps<{
    options: readonly IdNameOption[]
    placeholder: string
    searchPlaceholder: string
    emptyText: string
    fullWidth?: boolean
    noneOptionLabel?: string
    noneValueLabel?: string
    noneOptionValue?: string
  }>(),
  {
    fullWidth: true,
    noneOptionValue: NONE_OPTION_VALUE,
    noneOptionLabel: undefined,
    noneValueLabel: undefined,
  },
)

const modelValue = defineModel<string>({ default: '' })

const open = ref(false)

const selectOptions = computed(() => {
  if (!props.noneOptionLabel) return props.options

  return [{ id: props.noneOptionValue, name: props.noneOptionLabel }, ...props.options]
})

const selectedLabel = computed(() => {
  if (!modelValue.value) return props.noneValueLabel ?? props.placeholder
  const found = props.options.find((option) => option.id === modelValue.value)
  return found?.name ?? props.placeholder
})

function isSelected(optionId: string) {
  if (optionId === props.noneOptionValue) return !modelValue.value
  return modelValue.value === optionId
}

function select(value: string) {
  modelValue.value = value === props.noneOptionValue ? '' : value
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
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
      <Command>
        <CommandInput :placeholder="searchPlaceholder" />
        <CommandList>
          <CommandEmpty>{{ emptyText }}</CommandEmpty>
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
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
