<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  classroomName?: string | null
}>()

const { t } = useI18n()

const displayName = computed(() => props.classroomName ?? t('classes.title'))
</script>

<template>
  <div class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
    <NuxtLink to="/classes" class="hover:text-foreground">
      {{ t('classProfile.backToClasses') }}
    </NuxtLink>
    <ChevronRight class="h-3 w-3" />
    <span class="text-foreground">
      {{ displayName }}
    </span>
  </div>
</template>
