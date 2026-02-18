import { defineStore } from 'pinia'
import type { User } from '~/types/api'

export const useUserStore = defineStore('user', () => {
  const { $api } = useNuxtApp()

  const user = ref<User | null>(null)
  const loading = ref(false)

  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name} ${user.value.last_name}`
  })

  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name.charAt(0)}${user.value.last_name.charAt(0)}`.toUpperCase()
  })

  async function fetchUser() {
    if (user.value) return
    loading.value = true
    try {
      user.value = await $api<User>('/user/me')
    }
    catch {
      user.value = null
    }
    finally {
      loading.value = false
    }
  }

  function clearUser() {
    user.value = null
  }

  return {
    user,
    loading,
    fullName,
    initials,
    fetchUser,
    clearUser,
  }
})
