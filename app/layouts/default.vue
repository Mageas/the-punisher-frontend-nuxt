<script setup lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  FileWarning,
  Gavel,
  LayoutDashboard,
  LogOut,
  School,
  Scale,
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
const { logout: authLogout, logoutAll: authLogoutAll, isAuthenticated } = useAuth()
const userStore = useUserStore()
const showLogoutAllConfirm = ref(false)

if (isAuthenticated.value) {
  await userStore.fetchUser()
}

async function logout() {
  userStore.clearUser()
  await authLogout()
}

async function logoutAllDevices(_: string) {
  userStore.clearUser()
  await authLogoutAll()
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
    links: [{ to: '/', icon: LayoutDashboard, label: t('sidebar.dashboard') }],
  },
  {
    label: t('sidebar.tracking'),
    links: [
      { to: '/penalties', icon: AlertTriangle, label: t('sidebar.penalties') },
      { to: '/punishments', icon: Gavel, label: t('sidebar.punishments') },
      { to: '/bonuses', icon: Star, label: t('sidebar.bonuses') },
    ],
  },
  {
    label: t('sidebar.management'),
    links: [
      { to: '/students', icon: Users, label: t('sidebar.students') },
      { to: '/classes', icon: School, label: t('sidebar.classes') },
    ],
  },
  {
    label: t('sidebar.configuration'),
    links: [
      { to: '/rules', icon: Scale, label: t('sidebar.rules') },
      {
        to: '/penalty-types',
        icon: AlertCircle,
        label: t('sidebar.penaltyTypes'),
      },
      {
        to: '/punishment-types',
        icon: FileWarning,
        label: t('sidebar.punishmentTypes'),
      },
      { to: '/bonus-types', icon: Trophy, label: t('sidebar.bonusTypes') },
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
            <div class="flex items-center gap-2 px-2 py-1.5">
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
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <SidebarMenuButton size="sm" class="size-8 shrink-0 cursor-pointer">
                    <LogOut class="size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-56">
                  <DropdownMenuItem class="cursor-pointer" @click="logout">
                    {{ t('sidebar.logout') }}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    class="cursor-pointer"
                    @click="showLogoutAllConfirm = true"
                  >
                    {{ t('sidebar.logoutAll') }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
    <ConfirmActionModal
      v-model:open="showLogoutAllConfirm"
      item-id="logout-all-devices"
      :action-fn="logoutAllDevices"
      :title="t('modals.logoutAll.title')"
      :message="t('modals.logoutAll.message')"
      :warning-message="t('modals.logoutAll.warning')"
      :cancel-label="t('modals.logoutAll.cancel')"
      :confirm-label="t('modals.logoutAll.confirm')"
      confirm-variant="destructive"
    />
  </SidebarProvider>
</template>
