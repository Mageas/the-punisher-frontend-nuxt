<script setup lang="ts">
import type { NuxtError } from '#app'
import { AlertTriangle, Home, RotateCcw } from 'lucide-vue-next'

const { t } = useI18n()
const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => {
  const fallbackStatus = (props.error as NuxtError & { status?: number }).status
  return props.error.statusCode ?? fallbackStatus ?? 500
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
    <div
      class="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive"
    >
      <AlertTriangle v-if="statusCode >= 500" class="h-12 w-12" />
      <span v-else class="text-4xl font-bold">{{ statusCode }}</span>
    </div>

    <h1 class="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
      {{ statusCode === 404 ? t('errors.pageNotFound') : t('errors.serverError') }}
    </h1>

    <div class="flex flex-col gap-4 sm:flex-row">
      <Button as-child variant="default">
        <NuxtLink to="/" class="cursor-pointer" @click.prevent="handleError">
          <Home class="mr-2 h-4 w-4" />
          {{ t('errors.backHome') }}
        </NuxtLink>
      </Button>

      <Button variant="outline" class="cursor-pointer" @click="() => $router.back()">
        <RotateCcw class="mr-2 h-4 w-4" />
        {{ t('errors.goBack') }}
      </Button>
    </div>
  </div>
</template>
