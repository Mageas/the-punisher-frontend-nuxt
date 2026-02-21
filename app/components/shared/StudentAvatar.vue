<script setup lang="ts">
const props = defineProps<{
  firstName: string
  lastName: string
}>()

const initials = computed(() => {
  return `${props.firstName.charAt(0)}${props.lastName.charAt(0)}`.toUpperCase()
})
</script>

<template>
  <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
    {{ initials }}
  </div>
</template>
