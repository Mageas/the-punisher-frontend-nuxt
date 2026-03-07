<script setup lang="ts">
import { cn, getInitials } from '~/lib/utils'

type StudentAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type StudentAvatarTone = 'secondary' | 'muted' | 'accent'

const props = withDefaults(
  defineProps<{
    firstName?: string | null
    lastName?: string | null
    size?: StudentAvatarSize
    tone?: StudentAvatarTone
    bordered?: boolean
  }>(),
  {
    firstName: '',
    lastName: '',
    size: 'sm',
    tone: 'secondary',
    bordered: false,
  },
)

const sizeClasses: Record<StudentAvatarSize, string> = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-16 w-16 text-xl font-semibold',
}

const toneClasses: Record<StudentAvatarTone, string> = {
  secondary: 'bg-secondary text-foreground',
  muted: 'bg-muted text-muted-foreground',
  accent: 'bg-accent text-accent-foreground',
}

const initials = computed(() => {
  return getInitials(props.firstName, props.lastName)
})
</script>

<template>
  <div
    :class="
      cn(
        'flex shrink-0 items-center justify-center rounded-full font-medium',
        sizeClasses[props.size],
        toneClasses[props.tone],
        props.bordered && 'border-2 border-background',
      )
    "
  >
    {{ initials }}
  </div>
</template>
