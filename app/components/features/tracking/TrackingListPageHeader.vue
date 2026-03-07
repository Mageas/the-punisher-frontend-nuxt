<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  createLabel: string
}>()

const emit = defineEmits<{
  create: []
}>()
</script>

<template>
  <PageHeaderBar align="center">
    <template #left>
      <h1 class="text-2xl font-bold tracking-tight">
        {{ props.title }}
      </h1>
    </template>

    <template #actions>
      <Button class="w-full cursor-pointer justify-center md:w-auto" @click="emit('create')">
        <Plus class="h-4 w-4" />
        {{ props.createLabel }}
      </Button>
    </template>
  </PageHeaderBar>
</template>
