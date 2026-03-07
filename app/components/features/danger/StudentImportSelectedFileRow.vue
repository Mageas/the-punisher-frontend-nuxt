<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    fileName: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  clear: []
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="flex items-center gap-2 text-sm text-muted-foreground"
    data-testid="student-import-selected-file"
  >
    <span class="max-w-48 truncate">{{ props.fileName }}</span>
    <button
      type="button"
      class="cursor-pointer text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      :disabled="props.disabled"
      :aria-label="t('dangerZone.importStudents.clearFile')"
      data-testid="student-import-clear-file"
      @click="emit('clear')"
    >
      <X class="size-3.5" />
    </button>
  </div>
</template>
