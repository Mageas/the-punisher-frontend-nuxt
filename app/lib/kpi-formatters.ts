export function formatRatio(current: number, total: number): string {
  return `${current} / ${total}`
}

export function formatPunishmentsProgress(total: number, pending: number, overdue: number): string {
  const resolved = Math.max(0, total - pending)
  return `${resolved} / ${total} (${overdue})`
}

export function computeTotalPages(total: number, itemsPerPage: number): number {
  if (itemsPerPage <= 0) return 1
  return Math.max(1, Math.ceil(total / itemsPerPage))
}
