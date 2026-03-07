<script setup lang="ts">
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    valueLabel: string
    footer: string
    highlighted?: boolean
    icon?: Component
  }>(),
  {
    highlighted: false,
    icon: undefined,
  },
)
</script>

<template>
  <div class="space-y-1 p-3.5">
    <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <component :is="props.icon" v-if="props.icon" class="size-3.5" />
      {{ props.label }}
    </div>

    <div class="flex items-baseline gap-1.5">
      <span
        class="text-xl font-bold tabular-nums tracking-tight"
        :class="props.highlighted ? 'text-success-foreground' : 'text-foreground'"
      >
        {{ props.value }}
      </span>
      <span class="text-xs text-muted-foreground">
        {{ props.valueLabel }}
      </span>
    </div>

    <p class="text-xs text-muted-foreground">
      {{ props.footer }}
    </p>
  </div>
</template>
