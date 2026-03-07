<script setup lang="ts">
const props = defineProps<{
  message: string
}>()
</script>

<template>
  <div
    class="rounded-lg border border-border p-6 text-sm text-muted-foreground"
    data-testid="section-empty-state"
  >
    {{ props.message }}
  </div>
</template>
