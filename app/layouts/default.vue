<script setup lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  ChevronsUpDown,
  FileWarning,
  Gavel,
  LayoutDashboard,
  LogOut,
  School,
  Scale,
  Settings,
  ShieldAlert,
  Skull,
  Star,
  Trophy,
  Users,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMediaQuery } from '@vueuse/core'
import { useUserStore } from '~/stores/user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const { t } = useI18n()
const route = useRoute()
const { logout: authLogout, isAuthenticated } = useAuth()
const userStore = useUserStore()
const isMobile = useMediaQuery('(max-width: 768px)')

if (isAuthenticated.value) {
  await userStore.fetchUser()
}

async function logout() {
  userStore.clearUser()
  await authLogout()
}

interface NavLink {
  to: string
  icon: typeof LayoutDashboard
  label: string
}

interface NavGroup {
  label: string
  links: NavLink[]
}

const navGroups = computed<NavGroup[]>(() => [
  {
    label: t('sidebar.general'),
    links: [{ to: '/', icon: LayoutDashboard, label: t('common.titles.dashboard') }],
  },
  {
    label: t('sidebar.tracking'),
    links: [
      { to: '/penalties', icon: AlertTriangle, label: t('common.titles.penalties') },
      { to: '/punishments', icon: Gavel, label: t('common.titles.punishments') },
      { to: '/bonuses', icon: Star, label: t('common.titles.bonuses') },
    ],
  },
  {
    label: t('sidebar.management'),
    links: [
      { to: '/students', icon: Users, label: t('common.titles.students') },
      { to: '/classes', icon: School, label: t('common.titles.classes') },
    ],
  },
  {
    label: t('sidebar.configuration'),
    links: [
      { to: '/rules', icon: Scale, label: t('common.titles.rules') },
      {
        to: '/penalty-types',
        icon: AlertCircle,
        label: t('common.titles.penaltyTypes'),
      },
      {
        to: '/punishment-types',
        icon: FileWarning,
        label: t('common.titles.punishmentTypes'),
      },
      { to: '/bonus-types', icon: Trophy, label: t('common.titles.bonusTypes') },
    ],
  },
  {
    label: t('sidebar.schedule'),
    links: [
      { to: '/schedule/slots', icon: CalendarDays, label: t('common.titles.schedule.slot') },
      {
        to: '/schedule/exceptions',
        icon: CalendarDays,
        label: t('common.titles.schedule.exception'),
      },
    ],
  },
])

function isActive(to: string): boolean {
  if (to === '/') return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <SidebarProvider>
    <Sidebar>
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
      <SidebarContent>
        <SidebarGroup v-for="group in navGroups" :key="group.label">
          <SidebarGroupLabel>{{ group.label }}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="link in group.links" :key="link.to">
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium"
                  >
                    {{ userStore.initials }}
                  </div>
                  <div class="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span class="truncate font-semibold">{{ userStore.fullName }}</span>
                    <span class="truncate text-xs text-muted-foreground">{{
                      userStore.user?.email
                    }}</span>
                  </div>
                  <ChevronsUpDown class="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                :side="isMobile ? 'top' : 'right'"
                align="end"
                class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              >
                <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium"
                  >
                    {{ userStore.initials }}
                  </div>
                  <div class="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span class="truncate font-semibold">{{ userStore.fullName }}</span>
                    <span class="truncate text-xs text-muted-foreground">{{
                      userStore.user?.email
                    }}</span>
                  </div>
                </div>
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
                <DropdownMenuItem class="cursor-pointer gap-2" @click="logout">
                  <LogOut class="size-4" />
                  {{ t('sidebar.logout') }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header class="flex h-12 items-center border-b px-3 md:px-4">
        <SidebarTrigger />
      </header>
      <div class="flex-1 p-4 md:p-8">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
