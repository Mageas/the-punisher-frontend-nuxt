<script setup lang="ts">
import { Pencil, School, Trash2 } from 'lucide-vue-next'
import type { Classroom } from '~/types/api'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

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
  <div class="mb-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <PageActionsMenu>
        <template #manage>
          <DropdownMenuItem class="cursor-pointer" @click="emit('edit')">
            <Pencil class="w-4 h-4" />
            {{ t('common.actions.edit') }}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" class="cursor-pointer" @click="emit('delete')">
            <Trash2 class="w-4 h-4" />
            {{ t('common.actions.delete') }}
          </DropdownMenuItem>
        </template>
      </PageActionsMenu>
    </div>
  </div>
</template>
