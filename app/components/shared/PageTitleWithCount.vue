<script setup lang="ts">
const props = defineProps<{
  title: string
  countLabel?: string
}>()

const shouldShowCount = computed(() => Boolean(props.countLabel))
</script>

<template>
  <h1 class="text-2xl font-bold tracking-tight">
    {{ props.title }}
  </h1>
  <Badge v-if="shouldShowCount" variant="outline" class="text-muted-foreground">
    {{ props.countLabel }}
  </Badge>
</template>
