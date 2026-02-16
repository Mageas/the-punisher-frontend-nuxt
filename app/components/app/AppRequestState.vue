<script setup lang="ts">
withDefaults(
  defineProps<{
    isLoading: boolean
    errorMessage?: string | null
    isEmpty: boolean
    loadingTitle?: string
    loadingDescription?: string
    emptyTitle?: string
    emptyDescription?: string
    retryLabel?: string
  }>(),
  {
    errorMessage: null,
    loadingTitle: "general.loading",
    loadingDescription: "general.loading_desc",
    emptyTitle: "general.no_data",
    emptyDescription: "general.empty_description",
    retryLabel: "general.retry",
  },
)

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <Card v-if="isLoading">
    <CardHeader>
      <CardTitle>{{ $t(loadingTitle) }}</CardTitle>
      <CardDescription>{{ $t(loadingDescription) }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <div class="h-4 w-full animate-pulse rounded bg-muted" />
        <div class="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div class="h-4 w-3/5 animate-pulse rounded bg-muted" />
      </div>
    </CardContent>
  </Card>

  <Card v-else-if="errorMessage">
    <CardHeader>
      <CardTitle>{{ $t('general.error') }}</CardTitle>
      <CardDescription>{{ $t('general.error_desc') }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{{ errorMessage }}</AlertDescription>
      </Alert>
      <Button variant="outline" @click="emit('retry')">
        {{ $t(retryLabel) }}
      </Button>
    </CardContent>
  </Card>

  <Card v-else-if="isEmpty">
    <CardHeader>
      <CardTitle>{{ $t(emptyTitle) }}</CardTitle>
      <CardDescription>{{ $t(emptyDescription) }}</CardDescription>
    </CardHeader>
  </Card>

  <slot v-else />
</template>
