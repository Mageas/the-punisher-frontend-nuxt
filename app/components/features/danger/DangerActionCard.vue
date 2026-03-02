<script setup lang="ts">
import type { FunctionalComponent } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    buttonLabel: string
    icon: FunctionalComponent
    disabled?: boolean
    disabledMessage?: string
  }>(),
  {
    disabled: false,
    disabledMessage: undefined,
  },
)

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div
    class="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-destructive-border hover:shadow-sm"
  >
    <div class="flex items-start gap-4">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive-bg-subtle text-destructive transition-colors group-hover:bg-destructive-bg-subtle-hover"
      >
        <component :is="props.icon" class="size-5" />
      </div>
      <div class="flex-1 min-w-0 space-y-3">
        <div class="space-y-1">
          <h3 class="text-sm font-semibold leading-none tracking-tight">{{ props.title }}</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">{{ props.description }}</p>
          <p
            v-if="props.disabled && props.disabledMessage"
            class="text-xs text-muted-foreground italic pt-1"
          >
            {{ props.disabledMessage }}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          class="cursor-pointer"
          :disabled="props.disabled"
          @click="emit('action')"
        >
          {{ props.buttonLabel }}
        </Button>
      </div>
    </div>
  </div>
</template>
