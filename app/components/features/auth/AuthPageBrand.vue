<script setup lang="ts">
import { Skull } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="mb-8 text-center">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
      <Skull class="h-6 w-6" />
    </div>
    <h1 class="text-2xl font-bold tracking-tight">
      {{ props.title }}
    </h1>
    <p class="mt-1 text-sm text-muted-foreground">
      {{ props.subtitle }}
    </p>
  </div>
</template>
