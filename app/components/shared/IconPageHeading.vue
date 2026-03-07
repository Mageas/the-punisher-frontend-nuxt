<script setup lang="ts">
import type { Component } from 'vue'

type IconPageHeadingTone = 'primary' | 'danger'

const props = withDefaults(
  defineProps<{
    icon: Component
    title: string
    description: string
    tone?: IconPageHeadingTone
  }>(),
  {
    tone: 'primary',
  },
)

const iconWrapperClasses: Record<IconPageHeadingTone, string> = {
  primary: 'bg-primary/10',
  danger: 'bg-destructive-bg-subtle',
}

const iconClasses: Record<IconPageHeadingTone, string> = {
  primary: 'text-primary',
  danger: 'text-destructive',
}
</script>

<template>
  <div class="flex items-center gap-3" data-testid="icon-page-heading">
    <div
      :class="['flex size-10 items-center justify-center rounded-lg', iconWrapperClasses[props.tone]]"
      data-testid="icon-page-heading-icon-wrapper"
    >
      <component :is="props.icon" :class="['size-5', iconClasses[props.tone]]" />
    </div>

    <div>
      <h1 class="text-2xl font-bold tracking-tight">{{ props.title }}</h1>
      <p class="text-sm text-muted-foreground">{{ props.description }}</p>
    </div>
  </div>
</template>
