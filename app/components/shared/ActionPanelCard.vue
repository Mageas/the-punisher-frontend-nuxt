<script setup lang="ts">
import type { FunctionalComponent } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    icon: FunctionalComponent
    variant?: 'destructive' | 'primary'
    contentClass?: string
    disabledMessage?: string
  }>(),
  {
    variant: 'destructive',
    contentClass: 'space-y-3',
    disabledMessage: undefined,
  },
)

const cardHoverClass = computed(() =>
  props.variant === 'primary'
    ? 'hover:border-primary-border hover:shadow-sm'
    : 'hover:border-destructive-border hover:shadow-sm',
)

const iconWrapperClass = computed(() =>
  props.variant === 'primary'
    ? 'bg-info-bg-subtle text-info-foreground group-hover:bg-info-bg-subtle-hover'
    : 'bg-destructive-bg-subtle text-destructive group-hover:bg-destructive-bg-subtle-hover',
)
</script>

<template>
  <div
    :class="[
      'group relative rounded-xl border border-border bg-card p-5 transition-all',
      cardHoverClass,
    ]"
  >
    <div class="flex items-start gap-4">
      <div
        :class="[
          'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors',
          iconWrapperClass,
        ]"
      >
        <component :is="props.icon" class="size-5" />
      </div>
      <div class="flex-1 min-w-0" :class="props.contentClass">
        <div class="space-y-1">
          <h3 class="text-sm font-semibold leading-none tracking-tight">{{ props.title }}</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">{{ props.description }}</p>
          <p v-if="props.disabledMessage" class="text-xs text-muted-foreground italic pt-1">
            {{ props.disabledMessage }}
          </p>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
