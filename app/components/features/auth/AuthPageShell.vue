<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <main class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <AuthPageBrand :title="props.title" :subtitle="props.subtitle" />
      <slot />
    </div>
  </main>
</template>
