<script setup lang="ts">
// This shadcn-generated file was locally modified and must not be overwritten.
// Local change summary:
// - Added i18n translations for sidebar accessibility labels.
import type { HTMLAttributes } from "vue"
import { PanelLeft } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { useSidebar } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar } = useSidebar()
const { t } = useI18n()
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <PanelLeft />
    <span class="sr-only">{{ t('ui.sidebar.toggle') }}</span>
  </Button>
</template>
