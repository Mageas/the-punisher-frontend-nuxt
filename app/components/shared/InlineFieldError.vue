<script setup lang="ts">
const props = defineProps<{
  message?: string | null
}>()
</script>

<template>
  <p
    v-if="props.message"
    class="text-sm text-destructive"
    data-testid="inline-field-error"
  >
    {{ props.message }}
  </p>
</template>
