<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

type ExpandableChoicePanelTone = 'info' | 'muted'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    tone?: ExpandableChoicePanelTone
  }>(),
  {
    subtitle: '',
    tone: 'muted',
  },
)

const emit = defineEmits<{
  click: []
}>()

const buttonClasses: Record<ExpandableChoicePanelTone, string> = {
  info: 'flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-3 text-left transition-colors hover:bg-info-bg-subtle/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  muted:
    'flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
}

const titleClasses: Record<ExpandableChoicePanelTone, string> = {
  info: 'text-info-foreground',
  muted: 'text-foreground',
}

const subtitleClasses: Record<ExpandableChoicePanelTone, string> = {
  info: 'text-info-foreground/80',
  muted: 'text-muted-foreground',
}

const chevronClasses: Record<ExpandableChoicePanelTone, string> = {
  info: 'text-info-foreground',
  muted: 'text-muted-foreground',
}
</script>

<template>
  <button type="button" :class="buttonClasses[props.tone]" @click="emit('click')">
    <div class="flex min-w-0 items-start gap-2.5">
      <slot name="icon" />

      <div class="min-w-0">
        <p :class="['text-sm font-medium', titleClasses[props.tone]]">
          {{ props.title }}
        </p>
        <p v-if="props.subtitle" :class="['text-sm', subtitleClasses[props.tone]]">
          {{ props.subtitle }}
        </p>
      </div>
    </div>

    <ChevronDown :class="['size-4 shrink-0', chevronClasses[props.tone]]" />
  </button>
</template>
