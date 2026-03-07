<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    inline?: boolean
    tone?: 'default' | 'muted' | 'info'
  }>(),
  {
    inline: false,
    tone: 'muted',
  },
)

const slots = useSlots()

const toneClass = computed(() => {
  if (props.tone === 'info') return 'text-info'
  if (props.tone === 'default') return 'text-foreground'
  return 'text-muted-foreground'
})

const metaClass = computed(() => [
  'mt-0.5 text-xs',
  toneClass.value,
  props.inline ? 'flex items-center' : '',
  slots.icon ? 'gap-1.5' : '',
])
</script>

<template>
  <p :class="metaClass">
    <slot name="icon" />
    <slot />
  </p>
</template>
