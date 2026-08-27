const DATE_FMT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export function formatStay(
  arrival?: Date | string | null,
  departure?: Date | string | null,
): string {
  const arrivalDate = arrival ? new Date(arrival) : null
  const departureDate = departure ? new Date(departure) : null

  if (arrivalDate && departureDate) {
    const nights = Math.round((departureDate.getTime() - arrivalDate.getTime()) / 86_400_000)
    const nightsLabel = nights > 0 ? ` · ${nights} night${nights === 1 ? '' : 's'}` : ''
    return `${DATE_FMT.format(arrivalDate)} → ${DATE_FMT.format(departureDate)}${nightsLabel}`
  }
  if (arrivalDate) return `Arriving ${DATE_FMT.format(arrivalDate)}`
  if (departureDate) return `Departing ${DATE_FMT.format(departureDate)}`
  return 'No dates given'
}

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
