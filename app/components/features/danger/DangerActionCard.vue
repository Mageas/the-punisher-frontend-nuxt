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

const cardDisabledMessage = computed(() => (props.disabled ? props.disabledMessage : undefined))
</script>

<template>
  <ActionPanelCard
    :title="props.title"
    :description="props.description"
    :icon="props.icon"
    :disabled-message="cardDisabledMessage"
  >
    <Button
      variant="destructive"
      size="sm"
      class="cursor-pointer"
      :disabled="props.disabled"
      @click="emit('action')"
    >
      {{ props.buttonLabel }}
    </Button>
  </ActionPanelCard>
</template>
