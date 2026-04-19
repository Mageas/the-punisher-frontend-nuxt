<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  as?: "div" | "nav" | "aside"
  ariaLabel?: string
}>()
</script>

<template>
  <component
    :is="props.as ?? 'div'"
    data-slot="sidebar-content"
    data-sidebar="content"
    :aria-label="props.ariaLabel"
    :class="cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden', props.class)"
  >
    <slot />
  </component>
</template>
