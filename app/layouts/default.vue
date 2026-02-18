<script setup lang="ts">
import {
  Skull,
  LayoutDashboard,
  Gavel,
  Star,
  Users,
  School,
  Scale,
  AlertCircle,
  FileWarning,
  Trophy,
  LogOut,
  Menu,
} from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()
const { logout } = useAuth()

const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
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

const navGroups: NavGroup[] = [
  {
    label: t('sidebar.general'),
    links: [
      { to: '/', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    ],
  },
  {
    label: t('sidebar.tracking'),
    links: [
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
      { to: '/penalty-types', icon: AlertCircle, label: t('sidebar.penaltyTypes') },
      { to: '/punishment-types', icon: FileWarning, label: t('sidebar.punishmentTypes') },
      { to: '/bonus-types', icon: Trophy, label: t('sidebar.bonusTypes') },
    ],
  },
]

function isActive(to: string): boolean {
  return route.path === to
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Sidebar Overlay (mobile) -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-[39] md:hidden"
      @click="closeSidebar"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-40 w-[260px] min-h-screen border-r border-border bg-background flex flex-col gap-6 py-6 px-3 overflow-y-auto transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <!-- Brand -->
      <div class="flex items-center gap-2 px-3 mb-2">
        <div class="flex items-center justify-center w-8 h-8 rounded-md bg-secondary">
          <Skull class="w-4 h-4" />
        </div>
        <span class="font-semibold text-sm">{{ t('app.title') }}</span>
      </div>

      <!-- Nav groups -->
      <div v-for="group in navGroups" :key="group.label">
        <p class="text-xs font-medium text-muted-foreground px-3 mb-1 uppercase tracking-wider">
          {{ group.label }}
        </p>
        <nav class="space-y-0.5">
          <NuxtLink
            v-for="link in group.links"
            :key="link.to"
            :to="link.to"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all',
              isActive(link.to)
                ? 'bg-secondary text-foreground font-medium'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            ]"
            @click="closeSidebar"
          >
            <component :is="link.icon" class="w-4 h-4" />
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>

      <!-- User footer -->
      <div class="mt-auto border-t border-border pt-3">
        <div class="flex items-center gap-3 px-3">
          <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
            JD
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">Jean Dupont</p>
            <p class="text-xs text-muted-foreground truncate">professeur@ecole.fr</p>
          </div>
          <button class="text-muted-foreground hover:text-foreground cursor-pointer" @click="logout">
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="md:ml-[260px] p-4 md:p-8">
      <!-- Mobile header -->
      <div class="flex items-center gap-3 md:hidden bg-background border-b border-border -m-4 mb-4 px-4 py-3">
        <button class="text-muted-foreground hover:text-foreground" @click="toggleSidebar">
          <Menu class="w-5 h-5" />
        </button>
        <span class="font-semibold text-sm">{{ t('app.title') }}</span>
      </div>

      <slot />
    </main>
  </div>
</template>
