export function useFormat() {
  const { t } = useI18n()

  /**
   * Get initials from a person's first and last name.
   */
  function getInitials(firstName?: string | null, lastName?: string | null): string {
    const firstInitial = firstName?.charAt(0) ?? ''
    const lastInitial = lastName?.charAt(0) ?? ''
    return `${firstInitial}${lastInitial}`.toUpperCase()
  }

  /**
   * Format points with optional 'pt' or 'pts' suffix.
   */
  function formatPoints(points: number): string {
    const suffix = points > 1 ? 'pts' : 'pt'
    return `${points} ${suffix}`
  }

  return {
    getInitials,
    formatPoints,
  }
}
