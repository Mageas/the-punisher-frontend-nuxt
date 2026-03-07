<script setup lang="ts">
type ExpandableChoicePanelTone = 'info' | 'muted'

const props = withDefaults(
  defineProps<{
    hint: string
    hideLabel: string
    title?: string
    tone?: ExpandableChoicePanelTone
  }>(),
  {
    title: '',
    tone: 'muted',
  },
)

const emit = defineEmits<{
  hide: []
}>()

const titleClasses: Record<ExpandableChoicePanelTone, string> = {
  info: 'text-info-foreground',
  muted: 'text-foreground',
}

const hintClasses: Record<ExpandableChoicePanelTone, string> = {
  info: 'text-info-foreground',
  muted: 'text-muted-foreground',
}

const hideButtonClasses: Record<ExpandableChoicePanelTone, string> = {
  info: 'text-info-foreground/80 hover:text-info-foreground',
  muted: 'text-muted-foreground hover:text-foreground',
}
</script>

<template>
  <div class="flex items-start justify-between gap-3">
    <div class="flex items-start gap-2.5">
      <slot name="icon" />

      <div :class="props.title ? 'space-y-1' : undefined">
        <p v-if="props.title" :class="['text-sm font-medium', titleClasses[props.tone]]">
          {{ props.title }}
        </p>
        <p :class="['text-sm leading-snug', hintClasses[props.tone]]">
          {{ props.hint }}
        </p>
      </div>
    </div>

    <button
      type="button"
      :class="['shrink-0 text-xs font-medium', hideButtonClasses[props.tone]]"
      @click="emit('hide')"
    >
      {{ props.hideLabel }}
    </button>
  </div>
</template>
