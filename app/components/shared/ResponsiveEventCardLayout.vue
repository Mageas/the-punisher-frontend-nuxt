<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    compact?: boolean
    dimmed?: boolean
  }>(),
  {
    compact: false,
    dimmed: false,
  },
)
</script>

<template>
  <div
    class="rounded-lg border border-border"
    :class="[{ 'opacity-60': props.dimmed }, props.compact ? 'p-3' : 'p-4']"
  >
    <div class="flex items-start gap-3 sm:hidden">
      <slot name="icon" />
      <div class="min-w-0 flex-1">
        <slot name="title" />
        <slot name="mobile-meta">
          <slot name="meta" />
        </slot>
        <div class="mt-2 flex items-center justify-between gap-3">
          <slot name="status" />
          <StudentEventActions v-if="$slots.actions">
            <slot name="actions" />
          </StudentEventActions>
        </div>
      </div>
    </div>

    <div class="hidden items-center gap-4 sm:flex">
      <slot name="icon" />
      <div class="min-w-0 flex-1">
        <slot name="title" />
        <slot name="desktop-meta">
          <slot name="meta" />
        </slot>
      </div>
      <slot name="status" />
      <StudentEventActions v-if="$slots.actions">
        <slot name="actions" />
      </StudentEventActions>
    </div>
  </div>
</template>
