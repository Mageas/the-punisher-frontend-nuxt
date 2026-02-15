<script setup lang="ts">
definePageMeta({
  layout: "auth",
})

const auth = useAuth()
const route = useRoute()
const router = useRouter()
const isSubmitting = ref(false)
const showRegisteredToast = ref(false)
let hideToastTimeout: ReturnType<typeof setTimeout> | undefined
const form = reactive({
  email: "",
  password: "",
})

onMounted(async () => {
  if (route.query.registered !== "1") {
    return
  }

  showRegisteredToast.value = true
  hideToastTimeout = setTimeout(() => {
    showRegisteredToast.value = false
  }, 3500)

  const nextQuery = { ...route.query }
  delete nextQuery.registered
  await router.replace({ path: route.path, query: nextQuery })
})

onBeforeUnmount(() => {
  if (hideToastTimeout) {
    clearTimeout(hideToastTimeout)
  }
})

async function onSubmit() {
  if (isSubmitting.value) {
    return
  }

  auth.clearErrors()
  isSubmitting.value = true
  try {
    await auth.login({
      email: form.email.trim(),
      password: form.password,
    })
    await navigateTo("/")
  } catch {
    // Error message handled by auth.lastError.
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
    <div
      v-if="showRegisteredToast"
      class="fixed right-4 top-4 z-50 w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <p class="text-sm font-semibold">Inscription reussie</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Votre compte a bien ete cree. Vous pouvez maintenant vous connecter.
      </p>
    </div>

    <Card class="w-full">
      <CardHeader>
        <CardTitle>Connexion enseignant</CardTitle>
        <CardDescription>
          Connectez-vous pour accéder à votre tableau de bord et commencer à gérer la discipline de votre classe avec The Punisher.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="professeur@ecole.fr"
              required
            />
            <p v-if="auth.fieldErrors.value.email" class="text-sm text-destructive">
              {{ auth.fieldErrors.value.email }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="password">Mot de passe</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="********"
              required
            />
            <p v-if="auth.fieldErrors.value.password" class="text-sm text-destructive">
              {{ auth.fieldErrors.value.password }}
            </p>
          </div>

          <Alert v-if="auth.lastError.value" variant="destructive">
            <AlertTitle>Connexion impossible</AlertTitle>
            <AlertDescription>{{ auth.lastError.value }}</AlertDescription>
          </Alert>

          <Button class="w-full" type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </Button>
        </form>
      </CardContent>
      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          Pas encore de compte ?
          <NuxtLink to="/register" class="font-medium text-primary underline-offset-4 hover:underline">
            S'inscrire
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
