<script setup lang="ts">
// This shadcn-generated file was locally modified and must not be overwritten.
// Local change summary:
// - Added synchronization between the internal filter state and the external modelValue prop, allowing for both controlled and uncontrolled usage of the CommandInput component.
import type { ListboxFilterProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Search } from "lucide-vue-next"
import { ListboxFilter, useForwardProps } from "reka-ui"
import { computed, watch } from "vue"
import { cn } from "@/lib/utils"
import { useCommand } from "."

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<ListboxFilterProps & {
  class?: HTMLAttributes["class"]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const delegatedProps = reactiveOmit(props, "class", "modelValue")

const forwardedProps = useForwardProps(delegatedProps)

const { filterState } = useCommand()

const searchValue = computed({
  get: () => {
    if (typeof props.modelValue === "string") {
      return props.modelValue
    }

    return filterState.search
  },
  set: (value: string) => {
    filterState.search = value
    emit("update:modelValue", value)
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (typeof value !== "string") return
    if (value === filterState.search) return
    filterState.search = value
  },
  { immediate: true },
)

watch(
  () => filterState.search,
  (value) => {
    if (typeof props.modelValue !== "string") return
    if (value === props.modelValue) return
    emit("update:modelValue", value)
  },
)
</script>

<template>
  <div
    data-slot="command-input-wrapper"
    class="flex h-9 items-center gap-2 border-b px-3"
  >
    <Search class="size-4 shrink-0 opacity-50" />
    <ListboxFilter
      v-bind="{ ...forwardedProps, ...$attrs }"
      v-model="searchValue"
      data-slot="command-input"
      auto-focus
      :class="cn('placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    />
  </div>
</template>
