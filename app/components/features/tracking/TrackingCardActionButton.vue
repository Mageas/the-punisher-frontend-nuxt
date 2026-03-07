<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  label: string
}>()

const attrs = useAttrs()
</script>

<template>
  <Button
    v-bind="attrs"
    variant="ghost"
    size="icon-sm"
    class="cursor-pointer text-muted-foreground hover:text-foreground"
    :title="props.label"
    :aria-label="props.label"
  >
    <slot />
  </Button>
</template>
