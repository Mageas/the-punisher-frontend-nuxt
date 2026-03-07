<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    description?: string
    tone?: 'muted' | 'success' | 'warning'
    desktopAlignRight?: boolean
  }>(),
  {
    description: undefined,
    tone: 'muted',
    desktopAlignRight: false,
  },
)

const badgeClass = computed(() => {
  if (props.tone === 'success') return 'text-success border-success-border'
  if (props.tone === 'warning') return 'text-warning border-warning-border'
  return 'text-muted-foreground'
})
</script>

<template>
  <div :class="props.desktopAlignRight ? 'sm:text-right' : undefined">
    <Badge variant="outline" :class="badgeClass">
      {{ props.label }}
    </Badge>
    <p v-if="props.description" class="mt-1 text-xs text-muted-foreground">
      {{ props.description }}
    </p>
  </div>
</template>
