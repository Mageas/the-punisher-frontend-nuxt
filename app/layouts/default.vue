<script setup lang="ts">
const auth = useAuth()
const route = useRoute()
import { Loader2 } from "lucide-vue-next"

const topNavigation = [
  { label: "general.dashboard", to: "/" },
  { label: "general.management", to: "/manage" },
]

function isCurrentRoute(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function onLogout() {
  await auth.logout()
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header v-if="auth.isAuthenticated.value" class="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex size-9 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              TP
            </div>
            <div>
              <p class="text-sm font-semibold">The Punisher</p>
              <p class="text-xs text-muted-foreground">{{ $t('general.management') }}</p>
            </div>
          </div>

          <div class="hidden items-center gap-2 md:flex">
            <Button size="sm" variant="outline" @click="onLogout">
              {{ $t('general.logout') }}
            </Button>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2">
          <nav class="flex flex-1 items-center gap-2 overflow-x-auto">
            <NuxtLink
              v-for="item in topNavigation"
              :key="item.to"
              :to="item.to"
              class="rounded-md px-3 py-1.5 text-sm transition-colors"
              :class="
                isCurrentRoute(item.to)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              "
            >
              {{ $t(item.label) }}
            </NuxtLink>
          </nav>

          <Button size="sm" variant="outline" class="md:hidden" @click="onLogout">
            {{ $t('general.logout') }}
          </Button>
        </div>
      </div>
    </header>

    <ClientOnly>
      <main v-if="auth.isAuthenticated.value" class="mx-auto w-full max-w-7xl px-4 py-8">
        <slot />
      </main>

      <template #fallback>
        <div class="flex h-[50vh] items-center justify-center">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
