<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    itemsCount: number
    loading?: boolean
    message: string
  }>(),
  {
    loading: false,
  },
)

const isVisible = computed(() => props.itemsCount === 0 && !props.loading)
</script>

<template>
  <div v-if="isVisible" class="py-16 text-center text-muted-foreground">
    {{ props.message }}
  </div>
</template>
