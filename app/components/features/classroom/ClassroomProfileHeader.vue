<script setup lang="ts">
import { Pencil, School, Trash2 } from 'lucide-vue-next'
import type { Classroom } from '~/types/api'

defineProps<{
  classroom: Classroom
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div class="flex items-center gap-4">
      <div class="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary">
        <School class="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ classroom.name }}
        </h1>
        <Badge variant="outline" class="mt-1 text-muted-foreground">
          {{ classroom.year }}
        </Badge>
      </div>
    </div>

    <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <Button variant="outline" class="cursor-pointer" @click="emit('edit')">
        <Pencil class="w-4 h-4" />
        {{ t('classProfile.actions.edit') }}
      </Button>
      <Button
        variant="outline"
        class="cursor-pointer text-destructive hover:text-destructive"
        @click="emit('delete')"
      >
        <Trash2 class="w-4 h-4" />
        {{ t('classProfile.actions.delete') }}
      </Button>
    </div>
  </div>
</template>
