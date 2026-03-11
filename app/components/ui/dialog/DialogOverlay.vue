<script setup lang="ts">
// CUSTOMIZATION NOTICE:
// This shadcn-generated file was locally modified and must not be overwritten.
// Local change summary:
// - Replaced the opaque dialog backdrop with a lightweight blur overlay and solid fallback.
import type { DialogOverlayProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DialogOverlay } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="delegatedProps"
    :class="cn('data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-overlay supports-[backdrop-filter]:bg-overlay-blur supports-[backdrop-filter]:backdrop-blur-[2px]', props.class)"
  >
    <slot />
  </DialogOverlay>
</template>
