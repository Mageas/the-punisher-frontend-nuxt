<script setup lang="ts">
definePageMeta({
  layout: "auth",
})

const auth = useAuth()
const isSubmitting = ref(false)
const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
})
const localError = ref<string | null>(null)

async function onSubmit() {
  if (isSubmitting.value) {
    return
  }

  localError.value = null
  auth.clearErrors()

  if (form.password !== form.confirmPassword) {
    localError.value = "Les mots de passe ne correspondent pas."
    return
  }

  isSubmitting.value = true
  try {
    await auth.register({
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
    })
    await navigateTo("/login?registered=1")
  } catch {
    // Error message handled by auth.lastError.
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
    <Card class="w-full">
      <CardHeader>
        <CardTitle>Inscription enseignant</CardTitle>
        <CardDescription>
          Créez un compte pour commencer à utiliser The Punisher et gérer la discipline de votre classe.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="first-name">Prénom</Label>
              <Input
                id="first-name"
                v-model="form.firstName"
                autocomplete="given-name"
                placeholder="Jean"
                required
              />
              <p v-if="auth.fieldErrors.value.first_name" class="text-sm text-destructive">
                {{ auth.fieldErrors.value.first_name }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="last-name">Nom</Label>
              <Input
                id="last-name"
                v-model="form.lastName"
                autocomplete="family-name"
                placeholder="Dupont"
                required
              />
              <p v-if="auth.fieldErrors.value.last_name" class="text-sm text-destructive">
                {{ auth.fieldErrors.value.last_name }}
              </p>
            </div>
          </div>

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
              autocomplete="new-password"
              placeholder="********"
              required
            />
            <p v-if="auth.fieldErrors.value.password" class="text-sm text-destructive">
              {{ auth.fieldErrors.value.password }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="confirm-password">Confirmer mot de passe</Label>
            <Input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="********"
              required
            />
          </div>

          <Alert v-if="localError" variant="destructive">
            <AlertTitle>Inscription impossible</AlertTitle>
            <AlertDescription>{{ localError }}</AlertDescription>
          </Alert>

          <Alert v-else-if="auth.lastError.value" variant="destructive">
            <AlertTitle>Inscription impossible</AlertTitle>
            <AlertDescription>{{ auth.lastError.value }}</AlertDescription>
          </Alert>

          <Button class="w-full" type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">Inscription en cours...</span>
            <span v-else>S'inscrire</span>
          </Button>
        </form>
      </CardContent>

      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          Déjà un compte ?
          <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
            Se connecter
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
