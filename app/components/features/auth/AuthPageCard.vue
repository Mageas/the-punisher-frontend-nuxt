<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()
</script>

<template>
  <div
    v-bind="attrs"
    :class="cn('rounded-lg border border-border bg-card p-6 shadow-sm', props.class)"
  >
    <slot />
  </div>
</template>
