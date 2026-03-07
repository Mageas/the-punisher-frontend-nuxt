<script setup lang="ts">
import { ChevronsUpDown, LogOut, Settings, ShieldAlert } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import AppSidebarUserSummary from '~/components/layout/AppSidebarUserSummary.vue'

const props = defineProps<{
  initials: string
  fullName: string
  email?: string | null
  isMobile: boolean
}>()

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()
</script>

<template>
  <SidebarFooter>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuButton
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <AppSidebarUserSummary
                :initials="props.initials"
                :full-name="props.fullName"
                :email="props.email"
              />
              <ChevronsUpDown class="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            :side="props.isMobile ? 'top' : 'right'"
            align="end"
            class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          >
            <AppSidebarUserSummary
              :initials="props.initials"
              :full-name="props.fullName"
              :email="props.email"
              class="px-1 py-1.5 text-left text-sm"
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem as-child class="cursor-pointer gap-2">
              <NuxtLink to="/settings">
                <Settings class="size-4" />
                {{ t('common.titles.userSettings') }}
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child class="cursor-pointer gap-2">
              <NuxtLink to="/management/danger">
                <ShieldAlert class="size-4" />
                {{ t('common.titles.dangerZone') }}
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="cursor-pointer gap-2" @click="emit('logout')">
              <LogOut class="size-4" />
              {{ t('sidebar.logout') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
</template>
