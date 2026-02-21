<script setup lang="ts">
type HeaderAlign = 'start' | 'center'

const props = withDefaults(defineProps<{ align?: HeaderAlign }>(), {
  align: 'start',
})

const containerClass = computed(() => [
  'mb-8 flex flex-col gap-4 xl:flex-row xl:justify-between',
  props.align === 'center' ? 'xl:items-center' : 'xl:items-start',
])
</script>

<template>
  <div :class="containerClass">
    <div class="flex flex-wrap items-center gap-4">
      <slot name="left" />
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2 xl:justify-end">
      <slot name="actions" />
    </div>
  </div>
</template>
