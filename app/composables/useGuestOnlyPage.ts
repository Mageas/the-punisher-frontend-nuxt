export async function useGuestOnlyPage(redirectTo = '/') {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated.value) {
    await navigateTo(redirectTo)
  }
}
