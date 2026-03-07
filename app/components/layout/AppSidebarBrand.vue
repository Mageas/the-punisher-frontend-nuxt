<script setup lang="ts">
import { Skull } from 'lucide-vue-next'
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const { t } = useI18n()
</script>

<template>
  <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div
            class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <Skull class="size-4" />
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">{{ t('app.title') }}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
</template>
