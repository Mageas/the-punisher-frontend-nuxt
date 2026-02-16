<script setup lang="ts">
import { cn } from "@/lib/utils"

const props = defineProps<{
  firstName?: string
  lastName?: string
  className?: string
}>()

const initials = computed(() => {
  const first = props.firstName?.charAt(0).toUpperCase() ?? ""
  const last = props.lastName?.charAt(0).toUpperCase() ?? ""
  return `${first}${last}`
})
</script>

<template>
  <div
    :class="cn(
      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted',
      className
    )"
  >
    <span class="font-medium text-muted-foreground">
      {{ initials }}
    </span>
  </div>
</template>
