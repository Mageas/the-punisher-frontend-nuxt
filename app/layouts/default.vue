<template>
  <div class="min-h-screen bg-background">
    <header class="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            TP
          </div>
          <div>
            <p class="text-sm font-semibold">The Punisher</p>
            <p class="text-xs text-muted-foreground">Discipline Management MVP</p>
          </div>
        </div>

        <div class="hidden items-center gap-2 md:flex">
          <Badge variant="secondary">
            Light only
          </Badge>
          <Badge variant="outline">
            chadcn-vue
          </Badge>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-7xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
