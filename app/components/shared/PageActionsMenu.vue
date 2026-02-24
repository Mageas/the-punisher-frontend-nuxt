<script setup lang="ts">
import { EllipsisVertical } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const props = withDefaults(
  defineProps<{
    label?: string
    createLabel?: string
    align?: 'start' | 'end'
  }>(),
  {
    label: undefined,
    createLabel: undefined,
    align: 'end',
  },
)

const { t } = useI18n()

const buttonLabel = computed(() => props.label ?? t('common.actions'))
const hasCreate = computed(() => !!useSlots().create)
const hasManage = computed(() => !!useSlots().manage)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="w-full cursor-pointer sm:w-auto">
        <EllipsisVertical class="w-4 h-4" />
        {{ buttonLabel }}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent :align="props.align" class="w-[calc(100vw-2rem)] sm:w-56">
      <template v-if="hasCreate">
        <DropdownMenuLabel v-if="createLabel">
          {{ createLabel }}
        </DropdownMenuLabel>
        <slot name="create" />
      </template>

      <DropdownMenuSeparator v-if="hasCreate && hasManage" />

      <slot name="manage" />
    </DropdownMenuContent>
  </DropdownMenu>
</template>
