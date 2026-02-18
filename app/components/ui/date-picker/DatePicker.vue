<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { HTMLAttributes } from 'vue'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import { CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  placeholder?: string
  showTime?: boolean
  class?: HTMLAttributes['class']
}>(), {
  placeholder: undefined,
  showTime: false,
})

const modelValue = defineModel<DateValue>()
const time = defineModel<string>('time', { default: '08:00' })

const openPopover = ref(false)

const df = new DateFormatter('fr-FR', { dateStyle: 'long' })

const hours = computed({
  get: () => time.value.split(':')[0] ?? '08',
  set: (v: string) => {
    const n = Math.max(0, Math.min(23, Number(v) || 0))
    time.value = `${String(n).padStart(2, '0')}:${minutes.value}`
  },
})

const minutes = computed({
  get: () => time.value.split(':')[1] ?? '00',
  set: (v: string) => {
    const n = Math.max(0, Math.min(59, Number(v) || 0))
    time.value = `${hours.value}:${String(n).padStart(2, '0')}`
  },
})

function formatDisplay(): string {
  if (!modelValue.value) return ''
  const formatted = df.format(modelValue.value.toDate(getLocalTimeZone()))
  if (props.showTime && time.value) {
    return `${formatted} ${time.value}`
  }
  return formatted
}

function onDateSelect(value: DateValue | undefined) {
  if (value) {
    modelValue.value = value
    if (!props.showTime) {
      openPopover.value = false
    }
  }
}
</script>

<template>
  <Popover v-model:open="openPopover">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn(
          'w-full justify-start text-left font-normal cursor-pointer',
          !modelValue && 'text-muted-foreground',
          props.class,
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4 shrink-0" />
        {{ modelValue ? formatDisplay() : (placeholder ?? $t('common.selectDate')) }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        :model-value="modelValue"
        :default-placeholder="today(getLocalTimeZone())"
        layout="month-and-year"
        initial-focus
        @update:model-value="onDateSelect"
      />
      <div v-if="showTime" class="border-t border-border px-3 py-2">
        <div class="flex items-center gap-2">
          <label class="text-sm text-muted-foreground whitespace-nowrap">{{ $t('common.time') }}</label>
          <div
            :class="cn(
              'dark:bg-input/30 border-input flex h-9 items-center rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] md:text-sm',
              'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
            )"
          >
            <input
              :value="hours"
              type="number"
              min="0"
              max="23"
              class="w-7 bg-transparent text-center tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              @change="(e: Event) => hours = (e.target as HTMLInputElement).value"
            >
            <span class="text-muted-foreground">:</span>
            <input
              :value="minutes"
              type="number"
              min="0"
              max="59"
              class="w-7 bg-transparent text-center tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              @change="(e: Event) => minutes = (e.target as HTMLInputElement).value"
            >
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
