<script setup lang="ts">
import type { BadgeVariants } from '@/components/ui/badge'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    text: string | number
    helpText?: string
    variant?: BadgeVariants['variant']
    badgeClass?: HTMLAttributes['class']
    tooltipClass?: HTMLAttributes['class']
  }>(),
  {
    variant: 'outline',
    helpText: undefined,
    badgeClass: undefined,
    tooltipClass: undefined,
  },
)
</script>

<template>
  <TooltipProvider v-if="props.helpText" :delay-duration="200">
    <Tooltip>
      <TooltipTrigger as-child>
        <span class="cursor-default">
          <Badge :variant="props.variant" :class="props.badgeClass">{{ props.text }}</Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        :class="cn('max-w-64 text-xs leading-relaxed', props.tooltipClass)"
      >
        {{ props.helpText }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>

  <Badge v-else :variant="props.variant" :class="props.badgeClass">{{ props.text }}</Badge>
</template>
