<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    subtitle?: string
    icon?: Component
    iconClass?: HTMLAttributes['class']
    valueClass?: HTMLAttributes['class']
  }>(),
  {
    subtitle: '',
    icon: undefined,
    iconClass: undefined,
    valueClass: undefined,
  },
)
</script>

<template>
  <div class="rounded-lg border border-border p-4 sm:p-6">
    <div class="mb-2 flex items-center justify-between">
      <p class="text-xs font-medium text-muted-foreground sm:text-sm">
        {{ props.label }}
      </p>
      <component :is="props.icon" v-if="props.icon" :class="cn('h-4 w-4', props.iconClass)" />
    </div>

    <p
      :class="
        cn(
          'whitespace-nowrap text-xl font-bold leading-none tabular-nums sm:text-3xl',
          props.valueClass,
        )
      "
    >
      {{ props.value }}
    </p>

    <p v-if="props.subtitle" class="mt-1 text-[11px] text-muted-foreground sm:text-xs">
      {{ props.subtitle }}
    </p>
  </div>
</template>
