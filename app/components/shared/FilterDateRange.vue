<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  label: string
}>()

const fromDate = defineModel<string>('from', { default: '' })
const toDate = defineModel<string>('to', { default: '' })

const fromDateValue = ref<DateValue>()
const toDateValue = ref<DateValue>()

function parseYYYYMMDD(str: string): DateValue | undefined {
  if (!str) return undefined
  const parts = str.split('-')
  if (parts.length !== 3) return undefined
  const [y, m, d] = parts.map(Number)
  if (!y || !m || !d) return undefined
  return new CalendarDate(y, m, d)
}

function formatYYYYMMDD(d: DateValue | undefined): string {
  if (!d) return ''
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

// Initialize from model values
onMounted(() => {
  fromDateValue.value = parseYYYYMMDD(fromDate.value)
  toDateValue.value = parseYYYYMMDD(toDate.value)
})

watch(fromDateValue, (val) => {
  fromDate.value = formatYYYYMMDD(val)
})

watch(toDateValue, (val) => {
  toDate.value = formatYYYYMMDD(val)
})

// Sync back when model values change externally (e.g. reset)
watch(fromDate, (val) => {
  const parsed = parseYYYYMMDD(val)
  if (formatYYYYMMDD(fromDateValue.value) !== val) {
    fromDateValue.value = parsed
  }
})

watch(toDate, (val) => {
  const parsed = parseYYYYMMDD(val)
  if (formatYYYYMMDD(toDateValue.value) !== val) {
    toDateValue.value = parsed
  }
})

const { t } = useI18n()

function clearDates() {
  fromDateValue.value = undefined
  toDateValue.value = undefined
}

const hasDates = computed(() => !!fromDate.value || !!toDate.value)
</script>

<template>
  <div class="space-y-1.5 sm:col-span-2 lg:col-span-2">
    <div class="flex items-center justify-between">
      <Label class="text-xs font-medium text-muted-foreground">{{ props.label }}</Label>
      <Button
        v-if="hasDates"
        variant="ghost"
        size="icon-sm"
        class="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground"
        @click="clearDates"
      >
        <X class="h-3 w-3" />
      </Button>
    </div>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <DatePicker
        v-model="fromDateValue"
        :placeholder="t('common.labels.from')"
        class="h-8 text-xs"
      />
      <DatePicker v-model="toDateValue" :placeholder="t('common.labels.to')" class="h-8 text-xs" />
    </div>
  </div>
</template>
