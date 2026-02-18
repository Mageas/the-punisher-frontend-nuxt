<script setup lang="ts">
import type { Student } from '~/types/api'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const props = defineProps<{
  students: readonly Student[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()
const open = ref(false)

const options = computed(() =>
  props.students.map(student => ({
    value: student.id,
    label: `${student.first_name} ${student.last_name}`,
  })),
)

const selectedLabel = computed(() => {
  if (!modelValue.value) return props.placeholder ?? t('modals.penalty.selectStudent')
  const found = options.value.find(option => option.value === modelValue.value)
  return found?.label ?? props.placeholder ?? t('modals.penalty.selectStudent')
})

function select(value: string) {
  modelValue.value = value
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
        class="w-full justify-between font-normal cursor-pointer hover:bg-accent hover:text-accent-foreground"
      >
        <span class="truncate">{{ selectedLabel }}</span>
        <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[--reka-popover-trigger-width] p-0" align="start">
      <Command>
        <CommandInput :placeholder="searchPlaceholder ?? t('modals.penalty.searchStudent')" />
        <CommandList>
          <CommandEmpty>{{ emptyText ?? t('modals.penalty.noStudentFound') }}</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option.value"
              :value="option.label"
              class="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              @select="select(option.value)"
            >
              <CheckIcon
                :class="cn(
                  'mr-2 h-4 w-4',
                  modelValue === option.value ? 'opacity-100' : 'opacity-0',
                )"
              />
              {{ option.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
