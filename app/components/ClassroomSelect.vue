<script setup lang="ts">
import type { Classroom } from "~/types/api"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-vue-next"
import { computed, ref } from "vue"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const ALL_STUDENTS_VALUE = "__all_students__"

const props = defineProps<{
  classrooms: readonly Classroom[]
}>()

const modelValue = defineModel<string>({ default: "" })

const { t } = useI18n()
const open = ref(false)

const options = computed(() => [
  { value: ALL_STUDENTS_VALUE, label: t("common.allStudents") },
  ...props.classrooms.map(classroom => ({
    value: classroom.id,
    label: classroom.name,
  })),
])

const selectedLabel = computed(() => {
  if (!modelValue.value) return t("common.allStudents")
  const found = options.value.find(option => option.value === modelValue.value)
  return found?.label ?? t("common.allStudents")
})

function select(value: string) {
  modelValue.value = value === ALL_STUDENTS_VALUE ? "" : value
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
        class="w-[200px] justify-between font-normal cursor-pointer hover:bg-accent hover:text-accent-foreground"
      >
        <span class="truncate">{{ selectedLabel }}</span>
        <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0" align="start">
      <Command>
        <CommandInput :placeholder="t('common.searchClass')" />
        <CommandList>
          <CommandEmpty>{{ t('common.noClassFound') }}</CommandEmpty>
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
                  (option.value === ALL_STUDENTS_VALUE && !modelValue) || modelValue === option.value
                    ? 'opacity-100'
                    : 'opacity-0',
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
