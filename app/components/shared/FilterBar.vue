<script setup lang="ts">
import { ChevronDown, Filter, RotateCcw } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    activeFilterCount?: number
  }>(),
  {
    activeFilterCount: 0,
  },
)

const emit = defineEmits<{
  reset: []
}>()

const { t } = useI18n()
const isOpen = ref(false)
</script>

<template>
  <Collapsible v-model:open="isOpen" class="mb-6">
    <div class="flex items-center gap-2">
      <CollapsibleTrigger as-child>
        <Button variant="outline" size="sm" class="cursor-pointer gap-2">
          <Filter class="h-4 w-4" />
          {{ t('filters.title') }}
          <Badge
            v-if="props.activeFilterCount > 0"
            variant="secondary"
            class="ml-1 h-5 min-w-5 px-1.5 text-xs"
          >
            {{ props.activeFilterCount }}
          </Badge>
          <ChevronDown
            :class="cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')"
          />
        </Button>
      </CollapsibleTrigger>

      <Button
        v-if="props.activeFilterCount > 0"
        variant="ghost"
        size="sm"
        class="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
        @click="emit('reset')"
      >
        <RotateCcw class="h-3.5 w-3.5" />
        {{ t('filters.reset') }}
      </Button>
    </div>

    <CollapsibleContent class="mt-3">
      <Card class="p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <slot />
        </div>
      </Card>
    </CollapsibleContent>
  </Collapsible>
</template>
