<script setup lang="ts">
const resources = [
  {
    title: "overview.students",
    to: "/manage/students",
    description: "overview.students_desc",
  },
  {
    title: "overview.classrooms",
    to: "/manage/classrooms",
    description: "overview.classrooms_desc",
  },
  {
    title: "overview.types",
    to: "/manage/types",
    description: "overview.types_desc",
  },
  {
    title: "overview.rules",
    to: "/manage/rules",
    description: "overview.rules_desc",
  },
  {
    title: "overview.bonuses",
    to: "/manage/bonuses",
    description: "overview.bonuses_desc",
  },
  {
    title: "overview.penalties",
    to: "/manage/penalties",
    description: "overview.penalties_desc",
  },
  {
    title: "overview.punishments",
    to: "/manage/punishments",
    description: "overview.punishments_desc",
  },
]
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>{{ $t('overview.title') }}</CardTitle>
        <CardDescription>
          {{ $t('overview.description') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card v-for="resource in resources" :key="resource.to">
            <CardHeader class="pb-2">
              <CardTitle class="text-lg">{{ $t(resource.title) }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <p class="text-sm text-muted-foreground">
                {{ $t(resource.description) }}
              </p>
              <Button as-child variant="outline" class="w-full">
                <NuxtLink :to="resource.to">
                  {{ $t('general.open') }}
                </NuxtLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

