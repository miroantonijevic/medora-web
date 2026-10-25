export type NightStatus = 'unknown' | 'available' | 'unavailable' | 'promo'

export type StayRange = { start: string | null; end: string | null }

/** The status of the night that begins on a date (the night of 24th is the one from 24th to 25th). */
export type NightStatusOf = (dateStr: string) => NightStatus

function isBookable(status: NightStatus): boolean {
  return status === 'available' || status === 'promo'
}

function nextDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

/** Whether every night from `from` (included) to `to` (excluded) can be booked. */
function allNightsBookable(from: string, to: string, statusOf: NightStatusOf): boolean {
  for (let day = from; day < to; day = nextDay(day)) {
    if (!isBookable(statusOf(day))) return false
  }
  return true
}

/**
 * What a click on a day does. A stay is a run of nights: a day can start a stay when its own night is
 * free, and it can end one when the nights before it are free, even if its own night is taken (the
 * guest leaves that morning). A stay never spans a taken night.
 *
 * Returns the new range, or null when the click is not allowed. A second click that would span a
 * taken night is refused rather than turned into a new start, so the check-in never changes by
 * surprise; `spansTakenNight` tells the caller to explain why.
 */
export function resolveDayClick(
  range: StayRange,
  dateStr: string,
  statusOf: NightStatusOf,
): StayRange | null {
  if (!range.start || range.end) {
    return isBookable(statusOf(dateStr)) ? { start: dateStr, end: null } : null
  }
  if (dateStr === range.start) return null

  const [low, high] = dateStr < range.start ? [dateStr, range.start] : [range.start, dateStr]
  return allNightsBookable(low, high, statusOf) ? { start: low, end: high } : null
}

/** Whether a second click on this day is refused because the stay would include a taken night. */
export function spansTakenNight(
  range: StayRange,
  dateStr: string,
  statusOf: NightStatusOf,
): boolean {
  return (
    !!range.start &&
    !range.end &&
    dateStr !== range.start &&
    resolveDayClick(range, dateStr, statusOf) === null
  )
}
