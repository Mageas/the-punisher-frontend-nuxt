<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = withDefaults(
  defineProps<{
    isEmpty: boolean
    emptyLabel: string
    listClass?: HTMLAttributes['class']
  }>(),
  {
    listClass: undefined,
  },
)
</script>

<template>
  <SectionEmptyState v-if="props.isEmpty" :message="props.emptyLabel" />

  <div v-else :class="props.listClass" data-testid="section-list-content">
    <slot />
  </div>
</template>
