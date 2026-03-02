<script setup lang="ts">
import type { Component } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { formatDate } from '~/lib/utils'

const props = withDefaults(
  defineProps<{
    name: string
    createdAt: string
    icon: Component
    iconClass?: string
    iconWrapperClass?: string
  }>(),
  {
    iconClass: 'text-muted-foreground',
    iconWrapperClass: 'bg-secondary',
  },
)

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center gap-4 rounded-lg border border-border p-4">
    <div
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
      :class="props.iconWrapperClass"
    >
      <component :is="props.icon" class="h-4 w-4" :class="props.iconClass" />
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold">
        {{ props.name }}
      </p>
      <p class="text-xs text-muted-foreground">
        {{ t('typeManagement.createdAt', { date: formatDate(props.createdAt) }) }}
      </p>
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        class="cursor-pointer text-muted-foreground hover:text-foreground"
        :title="t('typeManagement.edit')"
        :aria-label="t('typeManagement.edit')"
        @click="emit('edit')"
      >
        <Pencil class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="cursor-pointer text-muted-foreground hover:text-foreground"
        :title="t('modals.delete.confirm')"
        :aria-label="t('modals.delete.confirm')"
        @click="emit('delete')"
      >
        <Trash2 class="h-4 w-4 text-danger" />
      </Button>
    </div>
  </div>
</template>
