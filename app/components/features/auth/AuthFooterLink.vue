<script setup lang="ts">
const props = defineProps<{
  prompt: string
  to: string
  label: string
}>()
</script>

<template>
  <p class="mt-4 text-center text-sm text-muted-foreground">
    {{ props.prompt }}
    <NuxtLink :to="props.to" class="underline underline-offset-4 hover:text-foreground">
      {{ props.label }}
    </NuxtLink>
  </p>
</template>
