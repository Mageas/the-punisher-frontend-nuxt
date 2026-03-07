<script setup lang="ts">
const props = defineProps<{
  fallbackLabel: string
  studentId?: string
  studentFirstName?: string
  studentLastName?: string
}>()

const hasStudentName = computed(() => Boolean(props.studentFirstName && props.studentLastName))
const displayedLabel = computed(() => {
  if (!hasStudentName.value) return props.fallbackLabel
  return `${props.studentFirstName} ${props.studentLastName}`
})
</script>

<template>
  <p class="min-w-0 truncate text-sm font-medium">
    <NuxtLink
      v-if="hasStudentName && props.studentId"
      :to="`/students/${props.studentId}`"
      class="transition-colors hover:text-primary hover:underline underline-offset-4"
    >
      {{ displayedLabel }}
    </NuxtLink>
    <span v-else>{{ displayedLabel }}</span>
  </p>
</template>
