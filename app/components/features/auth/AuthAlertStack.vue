<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { AlertVariants } from '~/components/ui/alert'

type AuthAlertItem = {
  id?: string | number
  message?: string | null
  variant?: AlertVariants['variant']
  class?: HTMLAttributes['class']
}

const props = defineProps<{
  alerts: AuthAlertItem[]
}>()

const visibleAlerts = computed(() =>
  props.alerts.filter(
    (alert) => typeof alert.message === 'string' && alert.message.trim().length > 0,
  ),
)
</script>

<template>
  <div v-if="visibleAlerts.length" class="mb-4 space-y-3">
    <Alert
      v-for="(alert, index) in visibleAlerts"
      :key="alert.id ?? index"
      :variant="alert.variant"
      :class="alert.class"
    >
      <AlertDescription>{{ alert.message }}</AlertDescription>
    </Alert>
  </div>
</template>
