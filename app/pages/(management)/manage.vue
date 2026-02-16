<script setup lang="ts">
const route = useRoute()

const resources = [
  {
    label: "Vue d'ensemble",
    to: "/manage",
  },
  {
    label: "Eleves",
    to: "/manage/students",
  },
  {
    label: "Classes",
    to: "/manage/classrooms",
  },
  {
    label: "Types",
    to: "/manage/types",
  },
  {
    label: "Rules",
    to: "/manage/rules",
  },
  {
    label: "Bonuses",
    to: "/manage/bonuses",
  },
  {
    label: "Penalties",
    to: "/manage/penalties",
  },
  {
    label: "Punishments",
    to: "/manage/punishments",
  },
]

function isActive(path: string) {
  if (path === "/manage") {
    return route.path === "/manage"
  }

  return route.path === path || route.path.startsWith(`${path}/`)
}

useSeoMeta({
  title: "Gestion - The Punisher",
  description: "Espace de gestion discipline par ressource.",
})
</script>

<template>
  <div class="space-y-6">
    <Card class="relative overflow-hidden border bg-gradient-to-r from-muted/40 via-background to-muted/10">
      <CardHeader class="space-y-4">
        <Badge variant="secondary" class="w-fit">
          Cockpit de gestion
        </Badge>
        <div class="space-y-2">
          <CardTitle class="text-2xl sm:text-3xl">
            Management par ressource
          </CardTitle>
          <CardDescription class="max-w-3xl">
            Chaque domaine dispose de sa propre page pour une navigation plus claire et plus rapide.
          </CardDescription>
        </div>
      </CardHeader>
    </Card>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">Ressources</CardTitle>
      </CardHeader>
      <CardContent>
        <nav class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="item in resources"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-1.5 text-sm transition-colors"
            :class="
              isActive(item.to)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            "
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </CardContent>
    </Card>

    <NuxtPage />
  </div>
</template>
