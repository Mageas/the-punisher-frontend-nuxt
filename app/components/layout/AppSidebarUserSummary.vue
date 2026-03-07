<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    initials: string
    fullName: string
    email?: string | null
  }>(),
  {
    email: '',
  },
)
</script>

<template>
  <div class="flex min-w-0 items-center gap-2" data-testid="app-sidebar-user-summary">
    <div
      class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-medium text-sidebar-primary-foreground"
    >
      {{ props.initials }}
    </div>
    <div class="grid min-w-0 flex-1 text-left text-sm leading-tight">
      <span class="truncate font-semibold">{{ props.fullName }}</span>
      <span v-if="props.email" class="truncate text-xs text-muted-foreground">
        {{ props.email }}
      </span>
    </div>
  </div>
</template>
