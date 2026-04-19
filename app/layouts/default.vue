<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import AppSidebarBrand from '~/components/layout/AppSidebarBrand.vue'
import AppSidebarNavGroup from '~/components/layout/AppSidebarNavGroup.vue'
import AppSidebarUserMenu from '~/components/layout/AppSidebarUserMenu.vue'
import { getAppNavigation } from '~/lib/app-navigation'
import { useUserStore } from '~/stores/user'
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
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

const navGroups = computed(() => getAppNavigation((key) => String(t(key))))
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <AppSidebarBrand />
      <SidebarContent as="nav" :aria-label="t('ui.sidebar.navLabel')">
        <AppSidebarNavGroup
          v-for="group in navGroups"
          :key="group.label"
          :group="group"
          :current-path="route.path"
        />
      </SidebarContent>
      <AppSidebarUserMenu
        :initials="userStore.initials"
        :full-name="userStore.fullName"
        :email="userStore.user?.email"
        :is-mobile="isMobile"
        @logout="logout"
      />
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
