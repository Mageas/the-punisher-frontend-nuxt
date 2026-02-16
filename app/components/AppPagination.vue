<script setup lang="ts">
import { Button } from "@/components/ui/button"

defineProps<{
  page: number
  hasNext: boolean
  hasPrevious: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: "update:page", page: number): void
}>()
</script>

<template>
  <div class="flex items-center justify-end space-x-2 py-4">
    <Button
      variant="outline"
      size="sm"
      :disabled="!hasPrevious || loading"
      @click="$emit('update:page', page - 1)"
    >
      {{ $t('pagination.previous') }}
    </Button>
    <div class="text-sm text-muted-foreground">
      {{ $t('pagination.page', { page }) }}
    </div>
    <Button
      variant="outline"
      size="sm"
      :disabled="!hasNext || loading"
      @click="$emit('update:page', page + 1)"
    >
      {{ $t('pagination.next') }}
    </Button>
  </div>
</template>
