<script setup lang="ts">
import { Button } from '~/components/ui/button'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    loading: false,
    disabled: false,
  },
)

const attrs = useAttrs()
const isDisabled = computed(() => props.loading || props.disabled)
</script>

<template>
  <Button
    v-bind="attrs"
    :disabled="isDisabled"
    :aria-busy="props.loading || undefined"
    :data-loading="props.loading || undefined"
  >
    <span
      v-if="props.loading"
      aria-hidden="true"
      class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
    <slot />
  </Button>
</template>
