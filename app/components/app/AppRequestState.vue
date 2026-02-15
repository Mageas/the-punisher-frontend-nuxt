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
    loadingTitle: "Chargement...",
    loadingDescription: "Recuperation des donnees en cours.",
    emptyTitle: "Aucune donnee",
    emptyDescription: "Aucun element a afficher pour le moment.",
    retryLabel: "Reessayer",
  },
)

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <Card v-if="isLoading">
    <CardHeader>
      <CardTitle>{{ loadingTitle }}</CardTitle>
      <CardDescription>{{ loadingDescription }}</CardDescription>
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
      <CardTitle>Erreur de chargement</CardTitle>
      <CardDescription>Impossible de recuperer les donnees.</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{{ errorMessage }}</AlertDescription>
      </Alert>
      <Button variant="outline" @click="emit('retry')">
        {{ retryLabel }}
      </Button>
    </CardContent>
  </Card>

  <Card v-else-if="isEmpty">
    <CardHeader>
      <CardTitle>{{ emptyTitle }}</CardTitle>
      <CardDescription>{{ emptyDescription }}</CardDescription>
    </CardHeader>
  </Card>

  <slot v-else />
</template>
