<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
const { t } = useI18n()

interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav
    class="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
    :aria-label="t('ui.breadcrumb')"
  >
    <div v-for="(item, index) in items" :key="index" class="flex items-center gap-2">
      <NuxtLink
        v-if="item.to && index < items.length - 1"
        :to="item.to"
        class="hover:text-foreground transition-colors"
      >
        {{ item.label }}
      </NuxtLink>
      <span v-else :class="{ 'text-foreground': index === items.length - 1 }">
        {{ item.label }}
      </span>
      <ChevronRight v-if="index < items.length - 1" class="h-3.5 w-3.5 shrink-0 opacity-50" />
    </div>
  </nav>
</template>
