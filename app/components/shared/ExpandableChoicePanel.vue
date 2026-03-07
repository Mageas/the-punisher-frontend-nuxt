<script setup lang="ts">
type ExpandableChoicePanelTone = 'info' | 'muted'

const props = withDefaults(
  defineProps<{
    expanded: boolean
    tone?: ExpandableChoicePanelTone
  }>(),
  {
    tone: 'muted',
  },
)

const panelClasses: Record<ExpandableChoicePanelTone, string> = {
  info: 'rounded-lg border border-info-border bg-info-bg-subtle',
  muted: 'rounded-lg border border-border/70 bg-muted/30',
}
</script>

<template>
  <div :class="panelClasses[props.tone]">
    <div v-if="props.expanded" class="space-y-3 p-3.5">
      <slot name="expanded" />
    </div>

    <slot v-else name="collapsed" />
  </div>
</template>
