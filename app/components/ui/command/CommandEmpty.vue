<script setup lang="ts">
// This shadcn-generated file was locally modified and must not be overwritten.
// Local change summary:
// - Removed default filtering behavior.
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Primitive } from "reka-ui"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { useCommand } from "."

const props = defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const { filterState, disableLocalFilter } = useCommand()
const isRender = computed(() => {
  if (disableLocalFilter.value) {
    return false
  }

  return !!filterState.search && filterState.filtered.count === 0
})
</script>

<template>
  <Primitive
    v-if="isRender"
    data-slot="command-empty"
    v-bind="delegatedProps" :class="cn('py-6 text-center text-sm', props.class)"
  >
    <slot />
  </Primitive>
</template>
