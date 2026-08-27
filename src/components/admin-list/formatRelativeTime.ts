const DATE_FMT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export function formatRelativeTime(value?: Date | string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  const diffMin = Math.round((Date.now() - date.getTime()) / 60_000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

export function formatShortDate(value?: Date | string | null): string {
  if (!value) return '—'
  return DATE_FMT.format(new Date(value))
}
