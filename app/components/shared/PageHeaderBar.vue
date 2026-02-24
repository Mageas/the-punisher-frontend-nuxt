<script setup lang="ts">
type HeaderAlign = 'start' | 'center'

const props = withDefaults(defineProps<{ align?: HeaderAlign }>(), {
  align: 'start',
})

const containerClass = computed(() => [
  'mb-8 flex flex-wrap items-center gap-3 md:gap-4',
  props.align === 'center' ? 'md:items-center' : 'md:items-start',
])
</script>

<template>
  <div :class="containerClass">
    <div class="flex flex-1 flex-wrap items-center gap-3 md:gap-4">
      <slot name="left" />
    </div>
    <div v-if="$slots.actions" class="w-full md:w-auto">
      <slot name="actions" />
    </div>
  </div>
</template>
