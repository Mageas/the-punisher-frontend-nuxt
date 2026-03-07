<script setup lang="ts">
import { AlertTriangle, Gavel, Star } from 'lucide-vue-next'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import PageActionsMenu from '~/components/shared/PageActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    createLabel: string
    addBonusLabel: string
    addPenaltyLabel: string
    addPunishmentLabel: string
    align?: 'start' | 'end'
  }>(),
  {
    align: 'end',
  },
)

const emit = defineEmits<{
  'create-bonus': []
  'create-penalty': []
  'create-punishment': []
}>()

const hasManage = computed(() => Boolean(useSlots().manage))
</script>

<template>
  <PageActionsMenu :create-label="props.createLabel" :align="props.align">
    <template #create>
      <DropdownMenuItem class="cursor-pointer" @click="emit('create-bonus')">
        <Star class="h-4 w-4 text-warning" />
        {{ props.addBonusLabel }}
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer" @click="emit('create-penalty')">
        <AlertTriangle class="h-4 w-4 text-warning" />
        {{ props.addPenaltyLabel }}
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer" @click="emit('create-punishment')">
        <Gavel class="h-4 w-4 text-danger" />
        {{ props.addPunishmentLabel }}
      </DropdownMenuItem>
    </template>

    <template v-if="hasManage" #manage>
      <slot name="manage" />
    </template>
  </PageActionsMenu>
</template>
