<script setup lang="ts">
import type { AppNavigationGroup } from '~/lib/app-navigation'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const props = defineProps<{
  group: AppNavigationGroup
  currentPath: string
}>()

function isActive(to: string): boolean {
  if (to === '/') return props.currentPath === to
  return props.currentPath === to || props.currentPath.startsWith(`${to}/`)
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>{{ props.group.label }}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="link in props.group.links" :key="link.to">
          <SidebarMenuButton as-child :is-active="isActive(link.to)">
            <NuxtLink :to="link.to">
              <component :is="link.icon" />
              <span>{{ link.label }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
